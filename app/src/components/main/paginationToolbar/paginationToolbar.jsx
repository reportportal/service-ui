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

import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { PageButtons } from './pageButtons';
import { PageSizeControl } from './pageSizeControl';
import { ItemCounter } from './itemCounter';

import styles from './paginationToolbar.scss';

const cx = classNames.bind(styles);

export const PaginationToolbar = ({
  activePage,
  pageCount,
  pageSize,
  itemCount,
  onChangePage,
  onChangePageSize,
}) => (
  <div className={cx('pagination-toolbar')}>
    {itemCount && <ItemCounter activePage={activePage} pageSize={pageSize} itemCount={itemCount} />}
    {pageCount > 1 && (
      <PageButtons activePage={activePage} pageCount={pageCount} onChangePage={onChangePage} />
    )}
    {pageSize && <PageSizeControl pageSize={pageSize} onChangePageSize={onChangePageSize} />}
  </div>
);
PaginationToolbar.propTypes = {
  activePage: PropTypes.number.isRequired,
  itemCount: PropTypes.number.isRequired,
  pageCount: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  onChangePage: PropTypes.func,
  onChangePageSize: PropTypes.func,
};
PaginationToolbar.defaultProps = {
  onChangePage: () => {},
  onChangePageSize: () => {},
};
