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
import { FAILED, PASSED } from 'common/constants/testStatuses';
import { hintMessages } from '../messages';
import styles from '../componentHealthCheckTable.scss';

const cx = classNames.bind(styles);

export const StatusColumn = ({ className, value }, name, { minPassingRate, formatMessage }) => {
  const status = value.passingRate < minPassingRate ? FAILED : PASSED;

  return (
    <div className={cx('status-col', className)}>
      {value.passingRate !== undefined && (
        <Fragment>
          <span className={cx('mobile-hint')}>{formatMessage(hintMessages.statusHint)}</span>
          <span className={cx('status-item', status.toLowerCase())}>{status}</span>
        </Fragment>
      )}
    </div>
  );
};

StatusColumn.propTypes = {
  value: PropTypes.object.isRequired,
  className: PropTypes.string.isRequired,
};
