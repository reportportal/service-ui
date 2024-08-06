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

import { Pagination, Table } from '@reportportal/ui-kit';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import styles from './paginationWrapper.scss';

const cx = classNames.bind(styles);

export const PaginationWrapper = ({ showPagination, tableProps, paginationProps }) => (
  <div className={cx('pagination-wrapper-container')}>
    <Table {...tableProps} />
    {showPagination && (
      <div className={cx('pagination-wrapper')}>
        <Pagination {...paginationProps} />
      </div>
    )}
  </div>
);

PaginationWrapper.propTypes = {
  showPagination: PropTypes.bool.isRequired,
  tableProps: PropTypes.object.isRequired,
  paginationProps: PropTypes.object.isRequired,
};
