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

import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { defineMessages, useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { MeatballMenuIcon, FilterOutlineIcon, Button, SearchIcon } from '@reportportal/ui-kit';
import { ssoUsersOnlySelector } from 'controllers/appInfo';
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
});

export const AllUsersHeader = ({ onInvite }) => {
  const { formatMessage } = useIntl();
  const ssoUsersOnly = useSelector(ssoUsersOnlySelector);

  return (
    <div className={cx('all-users-header-container')}>
      <div className={cx('header')}>
        <span className={cx('title')}>{formatMessage(messages.allUsersTitle)}</span>
        <div className={cx('actions')}>
          <div className={cx('icons')}>
            <SearchIcon />
            <i className={cx('filter-icon')}>
              <FilterOutlineIcon />
            </i>
            {!ssoUsersOnly && (
              <Button variant="ghost" onClick={onInvite}>
                {formatMessage(messages.invite)}
              </Button>
            )}
            <Button variant="ghost" onClick={() => {}} className={cx('meatball-button')}>
              <MeatballMenuIcon />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

AllUsersHeader.propTypes = {
  onInvite: PropTypes.func,
};

AllUsersHeader.defaultProps = {
  onInvite: () => {},
};
