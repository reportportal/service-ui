/*
 * Copyright 2022 EPAM Systems
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
import classNames from 'classnames/bind';
import { BackBreadcrumb } from './backBreadcrumb';
import { Breadcrumb } from './breadcrumb';
import { Meatball } from './meatball';
import styles from './breadcrumbs.scss';

const cx = classNames.bind(styles);

/* eslint-disable react/no-array-index-key */
export const Breadcrumbs = ({ paths, url, dataAutomationId }) => {
  const shownPaths = [...paths];
  const { path: firstLevelPath, text: firstLevelPathText = firstLevelPath } = shownPaths[0];

  let hiddenPaths = [];
  if (shownPaths.length > 5) {
    hiddenPaths = shownPaths.splice(1, shownPaths.length - 4);
  }

  const maxBreadcrumbWidth =
    (740 - (hiddenPaths.length ? 36 : 0) - (shownPaths.length - 1) * 20) / shownPaths.length;

  return (
    <div className={cx('breadcrumbs-container')} data-automation-id={dataAutomationId}>
      {paths.length === 1 ? (
        <BackBreadcrumb url={`${url}/${firstLevelPath}`} text={firstLevelPathText} />
      ) : (
        <div className={cx('breadcrumbs')}>
          {hiddenPaths.length ? (
            <>
              <Breadcrumb
                key={'breadcrumb-0'}
                maxBreadcrumbWidth={maxBreadcrumbWidth}
                text={firstLevelPathText}
                url={`${url}/${firstLevelPath}`}
              />
              <Meatball paths={hiddenPaths} url={`${url}/${firstLevelPath}`} />
              {shownPaths.map(({ path, text }, index) => {
                if (index !== 0) {
                  return (
                    <Breadcrumb
                      key={`breadcrumb-${index}`}
                      maxBreadcrumbWidth={maxBreadcrumbWidth}
                      text={text || path}
                      url={`${url}/${firstLevelPath}/${hiddenPaths.map((p) => p.path).join('/')}
                        /${shownPaths
                          .map((p) => p.path)
                          .slice(1, index + 1)
                          .join('/')}`}
                    />
                  );
                }
                return null;
              })}
            </>
          ) : (
            <>
              {shownPaths.map(({ path, text }, index) => (
                <Breadcrumb
                  key={`breadcrumb-${index}`}
                  maxBreadcrumbWidth={maxBreadcrumbWidth}
                  text={text || path}
                  url={`${url}/${shownPaths
                    .map((p) => p.path)
                    .slice(0, index + 1)
                    .join('/')}`}
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

Breadcrumbs.propTypes = {
  paths: PropTypes.arrayOf(
    PropTypes.shape({
      path: PropTypes.string,
      text: PropTypes.string,
    }),
  ),
  url: PropTypes.string,
  dataAutomationId: PropTypes.string,
};

Breadcrumbs.defaultProps = {
  paths: [],
  url: '',
  dataAutomationId: '',
};
