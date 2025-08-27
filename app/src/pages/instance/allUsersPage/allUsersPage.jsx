/*
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

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useIntl, defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import { EmptyPageState } from 'pages/common';
import NoResultsIcon from 'common/img/newIcons/no-results-icon-inline.svg';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import {
  loadingSelector,
  allUsersSelector,
  allUsersPaginationSelector,
} from 'controllers/instance/allUsers';
import {
  NAMESPACE,
  DEFAULT_SORT_COLUMN,
  SORTING_KEY,
} from 'controllers/instance/allUsers/constants';
import { withPagination } from 'controllers/pagination';
import { withSortingURL, SORTING_ASC } from 'controllers/sorting';
import classNames from 'classnames/bind';
import { AllUsersHeader } from './allUsersHeader';
import { AllUsersListTable } from './allUsersListTable';
import styles from './allUsersPage.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  noResultsDescription: {
    id: 'AllUsersPage.noResultsDescription',
    defaultMessage: `Your search or filter criteria didn't match any results. Please try different keywords or adjust your filter settings.`,
  },
});

const AllUsersPageComponent = ({
  sortingDirection,
  onChangeSorting,
  pageSize,
  activePage,
  itemCount,
  pageCount,
  onChangePage,
  onChangePageSize,
}) => {
  const { formatMessage } = useIntl();
  const users = useSelector(allUsersSelector);
  const isLoading = useSelector(loadingSelector);
  const [searchValue, setSearchValue] = useState(null);
  const [appliedFiltersCount, setAppliedFiltersCount] = useState(0);

  return (
    <div className={cx('all-users-page')}>
      <AllUsersHeader
        isLoading={isLoading}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        appliedFiltersCount={appliedFiltersCount}
        setAppliedFiltersCount={setAppliedFiltersCount}
      />
      {itemCount === 0 && !isLoading ? (
        <EmptyPageState
          label={formatMessage(COMMON_LOCALE_KEYS.NO_RESULTS)}
          description={formatMessage(messages.noResultsDescription)}
          emptyIcon={NoResultsIcon}
        />
      ) : (
        <AllUsersListTable
          users={users}
          sortingDirection={sortingDirection}
          onChangeSorting={onChangeSorting}
          pageSize={pageSize}
          activePage={activePage}
          itemCount={itemCount}
          pageCount={pageCount}
          onChangePage={onChangePage}
          onChangePageSize={onChangePageSize}
        />
      )}
    </div>
  );
};

AllUsersPageComponent.propTypes = {
  sortingDirection: PropTypes.string,
  onChangeSorting: PropTypes.func,
  pageSize: PropTypes.number,
  activePage: PropTypes.number,
  itemCount: PropTypes.number,
  pageCount: PropTypes.number,
  onChangePage: PropTypes.func,
  onChangePageSize: PropTypes.func,
};

export const AllUsersPage = withSortingURL({
  defaultFields: [DEFAULT_SORT_COLUMN],
  defaultDirection: SORTING_ASC,
  sortingKey: SORTING_KEY,
  namespace: NAMESPACE,
})(
  withPagination({
    paginationSelector: allUsersPaginationSelector,
    namespace: NAMESPACE,
  })(AllUsersPageComponent),
);
