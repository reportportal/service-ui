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

import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { useIntl } from 'react-intl';
import { NAMESPACE, SEARCH_KEY } from 'controllers/organization/users';
import { SearchField } from 'components/fields/searchField';
import { withFilter } from 'controllers/filter';
import { useSelector } from 'react-redux';
import { activeOrganizationSelector } from 'controllers/organization';
import { InviteUserButton } from 'pages/inside/common/invitations';
import { ORGANIZATION_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/organizationsPageEvents';
import { LocationHeaderLayout } from 'layouts/locationHeaderLayout';
import { messages } from '../../messages';
import styles from './organizationUsersPageHeader.scss';

const cx = classNames.bind(styles);

const SearchFieldWithFilter = withFilter({ filterKey: SEARCH_KEY, namespace: NAMESPACE })(
  SearchField,
);

export const OrganizationUsersPageHeader = ({
  hasPermission,
  onInvite,
  isUsersLoading,
  searchValue,
  setSearchValue,
}) => {
  const { formatMessage } = useIntl();
  const organization = useSelector(activeOrganizationSelector);
  const usersCount = organization?.relationships?.users?.meta.count;
  const isNotEmpty = usersCount > 0;

  return (
    <LocationHeaderLayout
      title={formatMessage(messages.organizationUsersTitle)}
      organizationName={organization.name}
    >
      <div className={cx('actions')}>
        {isNotEmpty && (
          <>
            <div className={cx('icons')}>
              <SearchFieldWithFilter
                isLoading={isUsersLoading}
                searchValue={searchValue}
                setSearchValue={setSearchValue}
                placeholder={formatMessage(messages.searchPlaceholder)}
                event={ORGANIZATION_PAGE_EVENTS.SEARCH_ORGANIZATION_USERS_FIELD}
              />
            </div>
            {hasPermission && <InviteUserButton onInvite={onInvite} />}
          </>
        )}
      </div>
    </LocationHeaderLayout>
  );
};

OrganizationUsersPageHeader.propTypes = {
  hasPermission: PropTypes.bool,
  isUsersLoading: PropTypes.bool.isRequired,
  searchValue: PropTypes.string.isRequired,
  setSearchValue: PropTypes.func.isRequired,
  onInvite: PropTypes.func,
};

OrganizationUsersPageHeader.defaultProps = {
  onInvite: () => {},
};
