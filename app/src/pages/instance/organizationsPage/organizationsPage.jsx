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

import { useSelector, useDispatch } from 'react-redux';
import { useTracking } from 'react-tracking';
import { useState } from 'react';
import PropTypes from 'prop-types';
import { userRolesSelector } from 'controllers/pages';
import { canCreateOrganization } from 'common/utils/permissions';
import classNames from 'classnames/bind';
import { useIntl } from 'react-intl';
import { BubblesLoader, PlusIcon } from '@reportportal/ui-kit';
import { EmptyPageState } from 'pages/common';
import {
  organizationsListLoadingSelector,
  organizationsListSelector,
  organizationsListPaginationSelector,
} from 'controllers/instance/organizations';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import NoResultsIcon from 'common/img/newIcons/no-results-icon-inline.svg';
import { getStorageItem, updateStorageItem } from 'common/utils/storageUtils';
import { assignedOrganizationsSelector, userIdSelector } from 'controllers/user';
import { ORGANIZATION_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/organizationsPageEvents';
import { showModalAction } from 'controllers/modal';
import EmptyIcon from './img/empty-organizations-inline.svg';
import { OrganizationsPageHeader } from './organizationsPageHeader';
import { OrganizationsPanelView } from './organizationsPanelView';
import { messages } from './messages';
import { NoAssignedEmptyPage } from './noAssignedEmptyPage';
import { createOrganizationAction } from 'controllers/organization';
import { CreateOrganizationModal } from './modals/createOrganizationModal';
import { INTERNAL } from 'common/constants/accountType';
import { withPagination } from 'controllers/pagination';
import { withSortingURL, SORTING_ASC } from 'controllers/sorting';
import {
  NAMESPACE,
  ORGANIZATIONS_DEFAULT_SORT_COLUMN,
  SORTING_KEY,
} from 'controllers/instance/organizations/constants';
import styles from './organizationsPage.scss';

const cx = classNames.bind(styles);
const PANEL_VIEW = 'PanelView';
const TABLE_VIEW = 'TableView';

const OrganizationsPageComponent = ({
  sortingColumn,
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
  const { trackEvent } = useTracking();
  const dispatch = useDispatch();
  const userRoles = useSelector(userRolesSelector);
  const hasPermission = canCreateOrganization(userRoles);
  const organizationsList = useSelector(organizationsListSelector);
  const isOrganizationsLoading = useSelector(organizationsListLoadingSelector);
  const userId = useSelector(userIdSelector);
  const [searchValue, setSearchValue] = useState(null);
  const [appliedFiltersCount, setAppliedFiltersCount] = useState(0);
  const [isOpenTableView, setIsOpenTableView] = useState(
    getStorageItem(`${userId}_settings`)?.organizationsPanel === TABLE_VIEW,
  );

  const assignedOrganizations = useSelector(assignedOrganizationsSelector);
  const noAssignedOrganizations = Object.keys(assignedOrganizations).length === 0 && !hasPermission;

  const openPanelView = () => {
    setIsOpenTableView(false);
    updateStorageItem(`${userId}_settings`, { organizationsPanel: PANEL_VIEW });
  };

  const openTableView = () => {
    setIsOpenTableView(true);
    updateStorageItem(`${userId}_settings`, { organizationsPanel: TABLE_VIEW });
  };

  const onSubmitCreateOrganization = (newOrganizationName) => {
    dispatch(
      createOrganizationAction({
        name: newOrganizationName,
        type: INTERNAL,
      }),
    );
  };

  const onCreateOrganization = () => {
    dispatch(
      showModalAction({
        component: <CreateOrganizationModal onSubmit={onSubmitCreateOrganization} />,
      }),
    );
    trackEvent(ORGANIZATION_PAGE_EVENTS.CLICK_CREATE_ORGANIZATION);
  };

  const getEmptyPageState = () => {
    if (isOrganizationsLoading) {
      return (
        <div className={cx('loader')}>
          <BubblesLoader />
        </div>
      );
    }

    if (noAssignedOrganizations) {
      return <NoAssignedEmptyPage />;
    }

    return searchValue === null && appliedFiltersCount === 0 ? (
      <EmptyPageState
        hasPermission={hasPermission}
        emptyIcon={EmptyIcon}
        icon={<PlusIcon />}
        label={formatMessage(
          hasPermission ? messages.noOrganizationsYet : messages.noOrganizationsAvailableYet,
        )}
        description={formatMessage(
          hasPermission ? messages.createNewOrganization : messages.description,
        )}
        buttonTitle={formatMessage(messages.createOrganization)}
        onClick={onCreateOrganization}
      />
    ) : (
      <EmptyPageState
        icon={<PlusIcon />}
        label={formatMessage(COMMON_LOCALE_KEYS.NO_RESULTS)}
        description={formatMessage(messages.noResultsDescription)}
        emptyIcon={NoResultsIcon}
        hasPermission={false}
      />
    );
  };

  return (
    <div className={cx('organizations-page')}>
      {!noAssignedOrganizations && (
        <OrganizationsPageHeader
          hasPermission={hasPermission}
          isEmpty={itemCount === 0 && searchValue === null && appliedFiltersCount === 0}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          openPanelView={openPanelView}
          openTableView={openTableView}
          isOpenTableView={isOpenTableView}
          appliedFiltersCount={appliedFiltersCount}
          setAppliedFiltersCount={setAppliedFiltersCount}
          onCreateOrganization={onCreateOrganization}
        />
      )}
      {itemCount === 0 ? (
        getEmptyPageState()
      ) : (
        <OrganizationsPanelView
          organizationsList={organizationsList}
          isOpenTableView={isOpenTableView}
          sortingColumn={sortingColumn}
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

OrganizationsPageComponent.propTypes = {
  sortingColumn: PropTypes.string,
  sortingDirection: PropTypes.string,
  onChangeSorting: PropTypes.func,
  pageSize: PropTypes.number,
  activePage: PropTypes.number,
  itemCount: PropTypes.number,
  pageCount: PropTypes.number,
  onChangePage: PropTypes.func,
  onChangePageSize: PropTypes.func,
};

export const OrganizationsPage = withSortingURL({
  defaultDirection: SORTING_ASC,
  defaultFields: [ORGANIZATIONS_DEFAULT_SORT_COLUMN],
  sortingKey: SORTING_KEY,
  namespace: NAMESPACE,
})(
  withPagination({
    paginationSelector: organizationsListPaginationSelector,
    namespace: NAMESPACE,
  })(OrganizationsPageComponent),
);
