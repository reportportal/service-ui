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

import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { hintMessages } from '../messages';
import styles from '../componentHealthCheckTable.scss';

const cx = classNames.bind(styles);

export const PassingRateColumn = ({ className, value }, name, { formatMessage }) => (
  <div className={cx('passing-rate-col', className)}>
    {value.passingRate !== undefined ? (
      <Fragment>
        <span className={cx('mobile-hint')}>{formatMessage(hintMessages.passingRateHint)}</span>
        <span className={cx('passing-rate-item')}>{value.passingRate.toFixed(2)}%</span>
      </Fragment>
    ) : (
      <Fragment>
        <span className={cx('mobile-hint')}>{formatMessage(hintMessages.passingRateHint)}</span>
        <span className={cx('total-item')}>
          {!!value.total && value.total.passingRate.toFixed(2)}%
        </span>
      </Fragment>
    )}
  </div>
);

PassingRateColumn.propTypes = {
  value: PropTypes.object.isRequired,
  className: PropTypes.string.isRequired,
};
