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

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { defineMessages, useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { MeatballMenuIcon, Button, Popover } from '@reportportal/ui-kit';
import { NAMESPACE, SEARCH_KEY } from 'controllers/instance/allUsers/constants';
import { SearchField } from 'components/fields/searchField';
import { ALL_USERS_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/allUsersPage';
import { withFilter } from 'controllers/filter';
import { createFilterEntitiesURLContainer } from 'components/filterEntities/containers';
import { ssoUsersOnlySelector } from 'controllers/appInfo';
import { showModalAction } from 'controllers/modal';
import { AllUsersFilter } from './allUsersFilter';
import styles from './allUsersHeader.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  allUsersTitle: {
    id: 'AllUsersPage.title',
    defaultMessage: 'All users',
  },
  searchPlaceholder: {
    id: 'AllUsersPage.searchPlaceholder',
    defaultMessage: 'Search by name',
  },
  export: {
    id: 'AllUsersPage.export',
    defaultMessage: 'Export',
  },
  invite: {
    id: 'AllUsersPage.invite',
    defaultMessage: 'Invite user',
  },
  createUser: {
    id: 'AllUsersPage.createUser',
    defaultMessage: 'Create user',
  },
});

const SearchFieldWithFilter = withFilter({ filterKey: SEARCH_KEY, namespace: NAMESPACE })(
  SearchField,
);

const FilterEntitiesURLContainer = createFilterEntitiesURLContainer(null, NAMESPACE);

export const AllUsersHeader = ({
  onInvite,
  isLoading,
  searchValue,
  setSearchValue,
  appliedFiltersCount,
  setAppliedFiltersCount,
}) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const [isOpen, setIsOpen] = useState(false);
  const ssoUsersOnly = useSelector(ssoUsersOnlySelector);

  const openCreateUserModal = () => {
    dispatch(
      showModalAction({
        id: 'createUserModal',
      }),
    );
    setIsOpen(false);
  };

  return (
    <div className={cx('all-users-header-container')}>
      <div className={cx('header')}>
        <span className={cx('title')}>{formatMessage(messages.allUsersTitle)}</span>
        <div className={cx('actions')}>
          <div className={cx('icons')}>
            <div className={cx('filters')}>
              <SearchFieldWithFilter
                isLoading={isLoading}
                searchValue={searchValue}
                setSearchValue={setSearchValue}
                placeholder={formatMessage(messages.searchPlaceholder)}
                event={ALL_USERS_PAGE_EVENTS.SEARCH_ALL_USERS_FIELD}
              />
              <FilterEntitiesURLContainer
                debounced={false}
                additionalFilter="full_name"
                render={({ entities, onChange }) => (
                  <AllUsersFilter
                    appliedFiltersCount={appliedFiltersCount}
                    setAppliedFiltersCount={setAppliedFiltersCount}
                    entities={entities}
                    onFilterChange={onChange}
                  />
                )}
              />
            </div>
            {!ssoUsersOnly && (
              <>
                <Button variant="ghost" onClick={onInvite}>
                  {formatMessage(messages.invite)}
                </Button>
                <Popover
                  placement={'bottom-end'}
                  isOpened={isOpen}
                  setIsOpened={setIsOpen}
                  content={
                    <button className={cx('popover-content')} onClick={openCreateUserModal}>
                      {formatMessage(messages.createUser)}
                    </button>
                  }
                >
                  <Button variant="ghost" className={cx('meatball-button')}>
                    <MeatballMenuIcon />
                  </Button>
                </Popover>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

AllUsersHeader.propTypes = {
  onInvite: PropTypes.func,
  isLoading: PropTypes.bool.isRequired,
  searchValue: PropTypes.string.isRequired,
  setSearchValue: PropTypes.func.isRequired,
  appliedFiltersCount: PropTypes.bool.isRequired,
  setAppliedFiltersCount: PropTypes.func.isRequired,
};

AllUsersHeader.defaultProps = {
  onInvite: () => {},
};
