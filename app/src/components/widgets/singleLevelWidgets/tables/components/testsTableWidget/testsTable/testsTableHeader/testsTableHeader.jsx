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

import * as React from 'react';
import classNames from 'classnames/bind';
import { PTColumns } from '../../pTypes';
import styles from './testsTableHeader.scss';

const cx = classNames.bind(styles);

function TestsTableHeader({ columns }) {
  const { name, count, percents, date, status, duration } = columns;

  return (
    <div className={cx('tests-table-header')}>
      <div className={cx('col', 'col-name')}>{name.header}</div>
      {count && (
        <div className={cx('col', 'col-count')}>
          <span className={cx('full')}>{count.header}</span>
          <span className={cx('short')}>{count.headerShort}</span>
        </div>
      )}
      {percents && (
        <div className={cx('col', 'col-percents')}>
          <span className={cx('full')}>{percents.header}</span>
          <span className={cx('short')}>{percents.headerShort}</span>
        </div>
      )}
      {status && (
        <div className={cx('col', 'col-status')}>
          <span className={cx('full')}>{status.header}</span>
          <span className={cx('short')}>{status.headerShort}</span>
        </div>
      )}
      {duration && (
        <div className={cx('col', 'col-duration')}>
          <span className={cx('full')}>{duration.header}</span>
          <span className={cx('short')}>{duration.headerShort}</span>
        </div>
      )}
      <div className={cx('col', 'col-date')}>{date.header}</div>
    </div>
  );
}

TestsTableHeader.propTypes = {
  columns: PTColumns.isRequired,
};

export { TestsTableHeader };
