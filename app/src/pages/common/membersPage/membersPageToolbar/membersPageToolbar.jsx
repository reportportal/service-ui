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

import React from 'react';
import PropTypes from 'prop-types';
import track from 'react-tracking';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { showModalAction } from 'controllers/modal';
import { injectIntl, defineMessages } from 'react-intl';
import { reduxForm } from 'redux-form';
import { userRolesType } from 'common/constants/projectRoles';
import { userRolesSelector } from 'controllers/pages';
import { ssoUsersOnlySelector } from 'controllers/appInfo';
import { canInviteInternalUser } from 'common/utils/permissions';
import { GhostButton } from 'components/buttons/ghostButton';
import { FieldProvider } from 'components/fields/fieldProvider';
import { InputSearch } from 'components/inputs/inputSearch';
import { validate, bindMessageToValidator } from 'common/utils/validation';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import PermissionMapIcon from 'common/img/permission-inline.svg';
import InviteUserIcon from 'common/img/invite-inline.svg';
import styles from './membersPageToolbar.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  permissionMap: {
    id: 'MembersPageToolbar.permissionMap',
    defaultMessage: 'Permission Map',
  },
  inviteUser: {
    id: 'MembersPageToolbar.inviteUser',
    defaultMessage: 'Invite User',
  },
  assignUser: {
    id: 'MembersPageToolbar.assignUser',
    defaultMessage: 'Assign User',
  },
  searchInputPlaceholder: {
    id: 'MembersPageToolbar.searchByName',
    defaultMessage: 'Search by name',
  },
});

@connect(
  (state) => ({
    userRoles: userRolesSelector(state),
    ssoUsersOnly: ssoUsersOnlySelector(state),
  }),
  {
    showModalAction,
  },
)
@reduxForm({
  form: 'filterSearch',
  enableReinitialize: true,
  validate: ({ filter }) => ({
    filter: bindMessageToValidator(validate.searchMembers, 'membersSearchHint')(filter),
  }),
})
@injectIntl
@track()
export class MembersPageToolbar extends React.Component {
  static propTypes = {
    intl: PropTypes.object,
    showModalAction: PropTypes.func.isRequired,
    onInvite: PropTypes.func,
    userRoles: userRolesType,
    ssoUsersOnly: PropTypes.bool,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    onFilterChange: PropTypes.func,
  };

  static defaultProps = {
    intl: {},
    onInvite: () => {},
    userRoles: {},
    ssoUsersOnly: false,
    onFilterChange: () => {},
  };

  handleFilterChange = (e, filter) => {
    if (validate.searchMembers(filter)) {
      this.props.onFilterChange(filter);
    }
  };

  showInviteUserModal = () => {
    this.props.showModalAction({ id: 'inviteUserModal', data: { onInvite: this.props.onInvite } });
  };

  showPermissionMapModal = () => {
    this.props.showModalAction({ id: 'permissionMapModal' });
  };

  getButtonText = () => {
    const { ssoUsersOnly } = this.props;
    if (ssoUsersOnly === undefined) return messages.inviteUser;
    return ssoUsersOnly ? messages.assignUser : messages.inviteUser;
  };

  render() {
    return (
      <div className={cx('members-page-toolbar')}>
        <div className={cx('search-input')}>
          <FieldProvider name="filter" onChange={this.handleFilterChange}>
            <FieldErrorHint>
              <InputSearch
                maxLength="128"
                placeholder={this.props.intl.formatMessage(messages.searchInputPlaceholder)}
              />
            </FieldErrorHint>
          </FieldProvider>
        </div>
        <div className={cx('members-page-controls')}>
          <GhostButton icon={PermissionMapIcon} onClick={this.showPermissionMapModal}>
            {this.props.intl.formatMessage(messages.permissionMap)}
          </GhostButton>
          <GhostButton
            icon={InviteUserIcon}
            onClick={this.showInviteUserModal}
            disabled={!canInviteInternalUser(this.props.userRoles)}
          >
            {this.props.intl.formatMessage(this.getButtonText())}
          </GhostButton>
        </div>
      </div>
    );
  }
}
