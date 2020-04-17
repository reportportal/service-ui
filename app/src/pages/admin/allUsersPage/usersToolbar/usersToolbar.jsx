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

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages } from 'react-intl';
import { ADMIN_ALL_USERS_PAGE_EVENTS } from 'components/main/analytics/events';
import { InputFilter } from 'components/inputs/inputFilter';
import { FilterEntitiesURLContainer } from 'components/filterEntities/containers';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { USERS } from 'common/constants/userObjectTypes';
import { UsersEntities } from './usersEntities';
import { ActionPanel } from './actionPanel';
import styles from './usersToolbar.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  deleteModalContent: {
    id: 'administrateUsersPageToolbar.allUsers',
    defaultMessage: '{count} items selected',
  },
});

@injectIntl
export class UsersToolbar extends PureComponent {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    selectedUsers: PropTypes.arrayOf(PropTypes.object),
    onDelete: PropTypes.func,
  };
  static defaultProps = {
    selectedUsers: [],
    onDelete: () => {},
  };
  getSelectedUsersCount = () => this.props.selectedUsers.length;
  isShowBulkEditPanel = () => this.getSelectedUsersCount() > 0;
  renderRightSideComponent = () => {
    const { intl, onDelete } = this.props;
    if (this.isShowBulkEditPanel()) {
      return (
        <div className={cx('users-bulk-toolbar')}>
          <div className={cx('users-bulk-toolbar-item')}>
            {intl.formatMessage(messages.deleteModalContent, {
              count: this.getSelectedUsersCount(),
            })}
          </div>
          <div className={cx(['users-bulk-button', 'users-bulk-toolbar-item'])} onClick={onDelete}>
            {intl.formatMessage(COMMON_LOCALE_KEYS.DELETE)}
          </div>
        </div>
      );
    }
    return <ActionPanel />;
  };

  render() {
    return (
      <div className={cx('users-toolbar')}>
        <div className={cx('entities-wrapper')}>
          <FilterEntitiesURLContainer
            debounced={false}
            render={({ entities, onChange }) => (
              <InputFilter
                id={USERS}
                entitiesProvider={UsersEntities}
                filterValues={entities}
                onChange={onChange}
                eventsInfo={{
                  openFilter: ADMIN_ALL_USERS_PAGE_EVENTS.FUNNEL_BTN,
                  applyBtn: ADMIN_ALL_USERS_PAGE_EVENTS.APPLY_FILTER_BTN,
                }}
              />
            )}
          />
        </div>
        {this.renderRightSideComponent()}
      </div>
    );
  }
}
