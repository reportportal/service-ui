/*
 * Copyright 2024 EPAM Systems
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

import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { Modal } from '@reportportal/ui-kit';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { appInfoSelector } from 'controllers/appInfo';
import { hideModalAction, withModal } from 'controllers/modal';
import { servicesUpdate } from 'common/utils/referenceDictionary';
import { messages } from '../../../messages';
import styles from './versionsOfConnectedServicesModal.scss';
import { VersionService } from './versionService';

const cx = classNames.bind(styles);

const VersionsOfConnectedServices = ({ data: { latestServiceVersions } }) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const appInfo = useSelector(appInfoSelector);
  const hideModal = () => dispatch(hideModalAction());

  const calculateServices = () => {
    const versionsServices = [];

    const versionsServicesNames = {
      api: 'API Service',
      uat: 'Authorization Service',
      index: 'Index Service',
      jobs: 'Jobs Service',
      ui: 'Service UI',
    };

    Object.keys(versionsServicesNames).forEach((serviceKey) => {
      const serviceValue = appInfo[serviceKey];
      const currentVersion = serviceValue?.build?.version;
      const latestVersion = latestServiceVersions[serviceValue.build.repo];

      versionsServices.push({
        name: versionsServicesNames[serviceKey],
        version: currentVersion,
        linkTo: servicesUpdate[serviceKey],
        isNewVersion: currentVersion !== latestVersion,
      });
    });

    const analyzer = appInfo.api?.extensions?.analyzers[0];

    if (analyzer) {
      versionsServices.push({
        name: 'Service Analyzer',
        version: analyzer.version,
        linkTo: servicesUpdate.analyzer,
      });
    }

    return versionsServices;
  };

  return (
    <Modal
      title={formatMessage(messages.servicesVersions)}
      cancelButton={{ children: formatMessage(COMMON_LOCALE_KEYS.CLOSE) }}
      onClose={hideModal}
      size="large"
    >
      <div className={cx('title')}>{formatMessage(messages.titleServicesVersionsModal)}</div>
      <div className={cx('header')}>
        <div className={cx('service-name')}>{formatMessage(messages.serviceName)}</div>
        <div>{formatMessage(messages.currentVersion)}</div>
      </div>
      {calculateServices().map((service) => (
        <VersionService service={service} content={formatMessage(messages.update)} />
      ))}
    </Modal>
  );
};

VersionsOfConnectedServices.propTypes = {
  data: PropTypes.string.isRequired,
};

export const VersionsOfConnectedServicesModal = withModal('versionsOfConnectedServicesModal')(
  VersionsOfConnectedServices,
);
