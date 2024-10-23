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
import { SORTING_ASC, withSortingURL } from 'controllers/sorting';
import { DEFAULT_PAGINATION, PAGE_KEY, withPagination } from 'controllers/pagination';
import { PaginationWrapper } from 'components/main/paginationWrapper';
import { organizationsListPaginationSelector } from 'controllers/instance/organizations';
import {
  DEFAULT_LIMITATION,
  DEFAULT_PAGE_SIZE_OPTIONS,
  NAMESPACE,
} from 'controllers/instance/organizations/constants';
import { DEFAULT_SORT_COLUMN, SORTING_KEY } from 'controllers/instance';
import styles from './organizationsPanelView.scss';
import { OrganizationCard } from './organizationCard';

const cx = classNames.bind(styles);

const OrganizationsPanelViewWrapped = ({
  organizationsList,
  pageSize,
  activePage,
  itemCount,
  pageCount,
  onChangePage,
  onChangePageSize,
}) => (
  <PaginationWrapper
    showPagination={organizationsList.length > 0}
    pageSize={pageSize}
    activePage={activePage}
    totalItems={itemCount}
    totalPages={pageCount}
    pageSizeOptions={DEFAULT_PAGE_SIZE_OPTIONS}
    changePage={onChangePage}
    changePageSize={onChangePageSize}
  >
    <div className={cx('organizations-list-wrapper')}>
      <div className={cx('organizations-list')}>
        {organizationsList.map((organization) => (
          <OrganizationCard key={organization.id} organization={organization} />
        ))}
      </div>
    </div>
  </PaginationWrapper>
);

OrganizationsPanelViewWrapped.propTypes = {
  organizationsList: PropTypes.array,
  pageSize: PropTypes.number,
  activePage: PropTypes.number,
  itemCount: PropTypes.number.isRequired,
  pageCount: PropTypes.number.isRequired,
  onChangePage: PropTypes.func.isRequired,
  onChangePageSize: PropTypes.func.isRequired,
};

OrganizationsPanelViewWrapped.defaultProps = {
  organizationsList: [],
  pageSize: DEFAULT_LIMITATION,
  activePage: DEFAULT_PAGINATION[PAGE_KEY],
};

export const OrganizationsPanelView = withSortingURL({
  defaultDirection: SORTING_ASC,
  defaultFields: [DEFAULT_SORT_COLUMN],
  sortingKey: SORTING_KEY,
})(
  withPagination({
    paginationSelector: organizationsListPaginationSelector,
    namespace: NAMESPACE,
  })(OrganizationsPanelViewWrapped),
);
