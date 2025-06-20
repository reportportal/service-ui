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

import { Fragment, Component } from 'react';
import track from 'react-tracking';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import DOMPurify from 'dompurify';
import { injectIntl, defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { canChangeUserRole } from 'common/utils/permissions';
import { urlProjectSlugSelector, userRolesSelector } from 'controllers/pages';
import { userIdSelector } from 'controllers/user';
import { MEMBERS_PAGE_EVENTS } from 'components/main/analytics/events';
import { ROLES_MAP } from 'common/constants/projectRoles';
import { ADMINISTRATOR } from 'common/constants/accountRoles';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { projectKeySelector } from 'controllers/project';

import styles from './projectRole.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  projectRoleMobile: { id: 'ProjectRole.mobileTitle', defaultMessage: 'Project role' },
  allPermissions: {
    id: 'ProjectRole.allPermissions',
    defaultMessage: 'Administrator has full privileges according to permission map',
  },
  updateMember: {
    id: 'ProjectRole.updateMember',
    defaultMessage: "Member ''<b>{name}</b>'' has been updated",
  },
});

@injectIntl
@connect(
  (state) => ({
    currentUser: userIdSelector(state),
    projectSlug: urlProjectSlugSelector(state),
    canChangeRole: canChangeUserRole(userRolesSelector(state)),
    projectKey: projectKeySelector(state),
  }),
  { showNotification },
)
@track()
export class ProjectRole extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    assignedProjects: PropTypes.object,
    showNotification: PropTypes.func,
    accountRole: PropTypes.string,
    userId: PropTypes.string,
    currentUser: PropTypes.string,
    canChangeRole: PropTypes.bool,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    projectKey: PropTypes.string.isRequired,
    projectSlug: PropTypes.string.isRequired,
  };
  static defaultProps = {
    assignedProjects: {},
    accountRole: '',
    userId: '',
    currentUser: '',
    showNotification: () => {},
    canChangeRole: false,
  };
  state = {
    currentRole: this.getUserRole(),
  };

  onChangeRole = (val) => {
    const { intl, userId, tracking } = this.props;
    const param = {
      users: {},
    };
    param.users[this.props.userId] = val;
    this.setState({ currentRole: val });
    tracking.trackEvent(MEMBERS_PAGE_EVENTS.CHANGE_PROJECT_ROLE);
    fetch(URLS.projectByName(this.props.projectKey), {
      method: 'put',
      data: param,
    })
      .then(() => {
        this.props.showNotification({
          message: intl.formatMessage(messages.updateMember, {
            b: (data) => DOMPurify.sanitize(`<b>${data}</b>`),
            name: userId,
          }),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
      })
      .catch((err) => {
        this.props.showNotification({
          message: err.msg,
          type: NOTIFICATION_TYPES.ERROR,
        });
      });
  };
  getUserRole() {
    const { assignedProjects, projectSlug } = this.props;
    return assignedProjects[projectSlug]?.projectRole;
  }
  render() {
    this.getUserRole();
    const { accountRole, intl } = this.props;
    return (
      <Fragment>
        <span className={cx('mobile-title', 'mobile-show')}>
          {intl.formatMessage(messages.projectRoleMobile)}:
        </span>
        <span className={cx('current-role', 'mobile-show')}>
          {accountRole === ADMINISTRATOR
            ? intl.formatMessage(messages.allPermissions)
            : this.state.currentRole}
        </span>
        {accountRole !== ADMINISTRATOR && (
          <div className={cx('roles-list', 'mobile-hide')}>
            <InputDropdown
              value={this.state.currentRole}
              options={ROLES_MAP}
              onChange={this.onChangeRole}
              disabled={!this.props.canChangeRole || this.props.userId === this.props.currentUser}
            />
          </div>
        )}
        {accountRole === ADMINISTRATOR && (
          <div className={cx('mobile-hide', 'all-permissions')}>
            {intl.formatMessage(messages.allPermissions)}
          </div>
        )}
      </Fragment>
    );
  }
}
