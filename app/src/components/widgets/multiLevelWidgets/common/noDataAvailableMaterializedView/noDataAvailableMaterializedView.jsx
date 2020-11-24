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

import React from 'react';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import { STATE_RENDERING } from 'components/widgets/common/constants';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader/spinningPreloader';
import { NoDataAvailable } from 'components/widgets/noDataAvailable';
import PropTypes from 'prop-types';
import styles from './noDataAvailableMaterializedView.scss';

const cx = classNames.bind(styles);

export const NoDataAvailableMaterializedView = ({ state, isLoading }) => {
  if (state === STATE_RENDERING) {
    return (
      <div className={cx('rendering-wrap')}>
        <div className={cx('rendering-spinner-wrap')}>
          <SpinningPreloader />
        </div>
        <div className={cx('rendering-info-wrap')}>
          <h3 className={cx('rendering-title')}>
            <FormattedMessage
              id="NoDataAvailableMaterializedView.renderingTitle"
              defaultMessage="Please wait, It could take up to several minutes."
            />
          </h3>
          <div className={cx('rendering-info')}>
            <FormattedMessage
              id="NoDataAvailableMaterializedView.renderingInfo"
              defaultMessage="Please wait, It could take up to several minutes."
            />
          </div>
        </div>
      </div>
    );
  }
  if (isLoading) {
    return <SpinningPreloader />;
  }

  return <NoDataAvailable />;
};

NoDataAvailableMaterializedView.propTypes = {
  state: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired,
};
