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

import PropTypes from 'prop-types';
import track from 'react-tracking';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { showModalAction } from 'controllers/modal';
import { injectIntl, defineMessages } from 'react-intl';
import { reduxForm } from 'redux-form';
import { activeProjectRoleSelector, userAccountRoleSelector } from 'controllers/user';
import { canInviteInternalUser } from 'common/utils/permissions';
import { GhostButton } from 'components/buttons/ghostButton';
import { FieldProvider } from 'components/fields/fieldProvider';
import { InputSearch } from 'components/inputs/inputSearch';
import { validate, bindMessageToValidator } from 'common/utils/validation';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { MEMBERS_PAGE_EVENTS } from 'components/main/analytics/events';
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
  searchInputPlaceholder: {
    id: 'MembersPageToolbar.searchByName',
    defaultMessage: 'Search by name',
  },
});
@connect(
  (state) => ({
    projectRole: activeProjectRoleSelector(state),
    accountRole: userAccountRoleSelector(state),
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
    projectRole: PropTypes.string,
    accountRole: PropTypes.string,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    onFilterChange: PropTypes.func,
  };

  static defaultProps = {
    intl: {},
    onInvite: () => {},
    projectRole: '',
    accountRole: '',
    onFilterChange: () => {},
  };

  handleFilterChange = (e, filter) => {
    if (validate.searchMembers(filter)) {
      this.props.onFilterChange(filter);
    }
  };

  showInviteUserModal = () => {
    this.props.tracking.trackEvent(MEMBERS_PAGE_EVENTS.INVITE_USER_CLICK);
    this.props.showModalAction({ id: 'inviteUserModal', data: { onInvite: this.props.onInvite } });
  };

  showPermissionMapModal = () => {
    this.props.tracking.trackEvent(MEMBERS_PAGE_EVENTS.PERMISSION_MAP_CLICK);
    this.props.showModalAction({ id: 'permissionMapModal' });
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
            disabled={!canInviteInternalUser(this.props.accountRole, this.props.projectRole)}
          >
            {this.props.intl.formatMessage(messages.inviteUser)}
          </GhostButton>
        </div>
      </div>
    );
  }
}
