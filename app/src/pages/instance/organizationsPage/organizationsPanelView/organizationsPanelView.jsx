/*!
 * Copyright 2025 EPAM Systems
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
import { DEFAULT_PAGINATION, PAGE_KEY } from 'controllers/pagination';
import { PaginationWrapper } from 'components/main/paginationWrapper';
import { ORGANIZATION_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/organizationsPageEvents';
import {
  DEFAULT_LIMITATION,
  DEFAULT_PAGE_SIZE_OPTIONS,
} from 'controllers/instance/organizations/constants';
import { OrganizationsPanels } from './organizationsPanels';
import { OrganizationsTable } from './organizationsTable';
import styles from './organizationsPanelView.scss';

const cx = classNames.bind(styles);

export const OrganizationsPanelView = ({
  organizationsList,
  pageSize,
  activePage,
  itemCount,
  pageCount,
  onChangePage,
  onChangePageSize,
  isOpenTableView,
  sortingColumn,
  sortingDirection,
  onChangeSorting,
}) => (
  <PaginationWrapper
    showPagination={itemCount > 0}
    pageSize={pageSize}
    activePage={activePage}
    totalItems={itemCount}
    totalPages={pageCount}
    pageSizeOptions={DEFAULT_PAGE_SIZE_OPTIONS}
    changePage={onChangePage}
    changePageSize={onChangePageSize}
    className={cx('organizations-pagination-wrapper')}
    changePageSizeEvent={ORGANIZATION_PAGE_EVENTS.changePageSize('all_organizations')}
  >
    {isOpenTableView ? (
      <OrganizationsTable
        organizationsList={organizationsList}
        sortingColumn={sortingColumn}
        sortingDirection={sortingDirection}
        onChangeSorting={onChangeSorting}
      />
    ) : (
      <OrganizationsPanels organizationsList={organizationsList} />
    )}
  </PaginationWrapper>
);

OrganizationsPanelView.propTypes = {
  organizationsList: PropTypes.array,
  pageSize: PropTypes.number,
  activePage: PropTypes.number,
  itemCount: PropTypes.number.isRequired,
  pageCount: PropTypes.number.isRequired,
  onChangePage: PropTypes.func.isRequired,
  onChangePageSize: PropTypes.func.isRequired,
  isOpenTableView: PropTypes.bool.isRequired,
  sortingColumn: PropTypes.string,
  sortingDirection: PropTypes.string,
  onChangeSorting: PropTypes.func,
};

OrganizationsPanelView.defaultProps = {
  organizationsList: [],
  pageSize: DEFAULT_LIMITATION,
  activePage: DEFAULT_PAGINATION[PAGE_KEY],
};
