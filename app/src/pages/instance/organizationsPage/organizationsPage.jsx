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

import { useSelector } from 'react-redux';
import { useState } from 'react';
import { userRolesSelector } from 'controllers/pages';
import { canCreateOrganization } from 'common/utils/permissions';
import classNames from 'classnames/bind';
import { useIntl } from 'react-intl';
import { BubblesLoader, PlusIcon } from '@reportportal/ui-kit';
import { EmptyPageState } from 'pages/common';
import {
  organizationsListLoadingSelector,
  organizationsListSelector,
} from 'controllers/instance/organizations';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import NoResultsIcon from 'common/img/newIcons/no-results-icon-inline.svg';
import { getStorageItem, updateStorageItem } from 'common/utils/storageUtils';
import { assignedOrganizationsSelector, userIdSelector } from 'controllers/user';
import EmptyIcon from './img/empty-organizations-inline.svg';
import { OrganizationsPageHeader } from './organizationsPageHeader';
import { OrganizationsPanelView } from './organizationsPanelView';
import { messages } from './messages';
import { NoAssignedEmptyPage } from './noAssignedEmptyPage';
import styles from './organizationsPage.scss';

const cx = classNames.bind(styles);
const PANEL_VIEW = 'PanelView';
const TABLE_VIEW = 'TableView';

export const OrganizationsPage = () => {
  const { formatMessage } = useIntl();
  const userRoles = useSelector(userRolesSelector);
  const hasPermission = canCreateOrganization(userRoles);
  const organizationsList = useSelector(organizationsListSelector);
  const isOrganizationsLoading = useSelector(organizationsListLoadingSelector);
  const userId = useSelector(userIdSelector);
  const [searchValue, setSearchValue] = useState(null);
  const [appliedFiltersCount, setAppliedFiltersCount] = useState(0);
  const isEmptyOrganizations = !isOrganizationsLoading && organizationsList.length === 0;
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
          isEmpty={isEmptyOrganizations && searchValue === null && appliedFiltersCount === 0}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          openPanelView={openPanelView}
          openTableView={openTableView}
          isOpenTableView={isOpenTableView}
          appliedFiltersCount={appliedFiltersCount}
          setAppliedFiltersCount={setAppliedFiltersCount}
        />
      )}
      {isEmptyOrganizations ? (
        getEmptyPageState()
      ) : (
        <OrganizationsPanelView
          organizationsList={organizationsList}
          isOpenTableView={isOpenTableView}
        />
      )}
    </div>
  );
};
