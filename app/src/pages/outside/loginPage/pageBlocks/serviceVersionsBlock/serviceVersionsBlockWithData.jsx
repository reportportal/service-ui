/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useState, useEffect, useCallback } from 'react';
import classNames from 'classnames/bind';
import { useSelector } from 'react-redux';
import fetchJsonp from 'fetch-jsonp';
import semverDiff from 'semver-diff';
import { appInfoSelector } from 'controllers/appInfo';
import { FormattedMessage } from 'react-intl';
import styles from './serviceVersionBlockWithData.scss';
import { ServiceVersionItemTooltip } from './serviceVersionBlockTooltip';

const cx = classNames.bind(styles);

export const ServiceVersionsBlockWithData = () => {
  const appInfo = useSelector(appInfoSelector);

  const [services, setServices] = useState({});
  const [isDeprecated, setIsDeprecated] = useState(false);
  const [latestVersions, setLatestVersions] = useState(null);

  const fetchVersions = async () => {
    try {
      const response = await fetchJsonp('https://status.reportportal.io/versions', {
        jsonpCallback: 'jsonp',
      });

      const latestServiceVersions = await response.json();
      setLatestVersions(latestServiceVersions);
    } catch (error) {
      console.log('Error fetching versions:', error);
    }
  };

  const calculateServices = useCallback(
    (latestServiceVersions) => {
      const calculatedServices = {};
      let hasDeprecated = false;

      Object.keys(appInfo).forEach((serviceKey) => {
        const service = appInfo[serviceKey];
        const { build } = service || {};

        if (!build?.version) return false;

        const currentVersion = build.version;
        const latestVersion = latestServiceVersions[build.repo];
        const serviceIsDeprecated =
          build.repo &&
          latestVersion &&
          (() => {
            try {
              return semverDiff(currentVersion, latestVersion);
            } catch {
              return false;
            }
          })();

        if (serviceIsDeprecated) hasDeprecated = true;

        calculatedServices[serviceKey] = {
          name: build.name,
          version: currentVersion,
          newVersion: latestVersion || null,
          repo: build.repo || null,
          isDeprecated: serviceIsDeprecated,
        };

        return true;
      });

      setIsDeprecated(hasDeprecated);
      return calculatedServices;
    },
    [appInfo],
  );

  useEffect(() => {
    fetchVersions();
  }, []);

  useEffect(() => {
    if (Object.keys(appInfo).length > 0 && latestVersions) {
      const calculatedServices = calculateServices(latestVersions);
      setServices(calculatedServices);
    }
  }, [appInfo, latestVersions, calculateServices]);

  return (
    <div className={cx('service-versions-block')}>
      <ServiceVersionItemTooltip
        className={cx('tooltip-block')}
        services={services}
        isDeprecated={isDeprecated}
      />
      {isDeprecated ? (
        <span className={cx('current-version')}>
          <FormattedMessage
            id={'ServiceVersionsBlock.deprecatedVersion'}
            defaultMessage={'New versions are available.'}
          />
        </span>
      ) : (
        <span className={cx('current-version')}>
          <FormattedMessage
            id={'ServiceVersionsBlock.currentVersion'}
            defaultMessage={'Current version'}
          />
        </span>
      )}
    </div>
  );
};
