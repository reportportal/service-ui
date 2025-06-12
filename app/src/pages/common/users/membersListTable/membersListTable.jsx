/*!
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

import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { Table } from '@reportportal/ui-kit';
import { DEFAULT_PAGE_SIZE_OPTIONS } from 'controllers/members/constants';
import { PaginationWrapper } from 'components/main/paginationWrapper';
import styles from './membersListTable.scss';

const cx = classNames.bind(styles);

export const MembersListTable = ({
  data,
  primaryColumn,
  fixedColumns,
  onTableSorting,
  showPagination,
  renderRowActions,
  sortingDirection,
  pageSize,
  activePage,
  itemCount,
  pageCount,
  onChangePage,
  onChangePageSize,
}) => {
  return (
    <PaginationWrapper
      showPagination={showPagination}
      pageSize={pageSize}
      activePage={activePage}
      totalItems={itemCount}
      totalPages={pageCount}
      pageSizeOptions={DEFAULT_PAGE_SIZE_OPTIONS}
      changePage={onChangePage}
      changePageSize={onChangePageSize}
      className={cx('members-pagination-wrapper')}
    >
      <Table
        data={data}
        primaryColumn={primaryColumn}
        fixedColumns={fixedColumns}
        renderRowActions={renderRowActions}
        className={cx('members-list-table')}
        sortingColumn={primaryColumn}
        sortingDirection={sortingDirection.toLowerCase()}
        onChangeSorting={onTableSorting}
        sortableColumns={primaryColumn.key}
      />
    </PaginationWrapper>
  );
};

MembersListTable.propTypes = {
  data: PropTypes.array.isRequired,
  primaryColumn: PropTypes.object.isRequired,
  fixedColumns: PropTypes.array.isRequired,
  onTableSorting: PropTypes.func.isRequired,
  showPagination: PropTypes.bool.isRequired,
  renderRowActions: PropTypes.func,
  sortingDirection: PropTypes.string.isRequired,
  pageSize: PropTypes.number.isRequired,
  activePage: PropTypes.number.isRequired,
  itemCount: PropTypes.number.isRequired,
  pageCount: PropTypes.number.isRequired,
  onChangePage: PropTypes.func.isRequired,
  onChangePageSize: PropTypes.func.isRequired,
};
