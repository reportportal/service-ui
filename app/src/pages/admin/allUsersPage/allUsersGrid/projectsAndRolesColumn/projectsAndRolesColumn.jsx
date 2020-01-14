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

import React, { Component, Fragment } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { Manager, Reference, Popper } from 'react-popper';
import track from 'react-tracking';
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { ADMIN_ALL_USERS_PAGE_EVENTS } from 'components/main/analytics/events';
import { showModalAction } from 'controllers/modal';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { fetchAllUsersAction, toggleUserRoleFormAction } from 'controllers/administrate/allUsers';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { SCREEN_XS_MAX_MEDIA } from 'common/constants/screenSizeVariables';
import { GhostButton } from 'components/buttons/ghostButton';
import { RolesRow } from './rolesRow';
import styles from './projectsAndRolesColumn.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  anassignUser: {
    id: 'projectsAndRolesColumn.anassignUser',
    defaultMessage: 'User has been unassigned from project!',
  },
  updateUserRole: {
    id: 'projectsAndRolesColumn.updateUserRole',
    defaultMessage: 'User "{user}" has been updated',
  },
  btnTitle: {
    id: 'projectsAndRolesColumn.anassignBtn',
    defaultMessage: 'Unassign',
  },
  unAssignTitle: {
    id: 'projectsAndRolesColumn.unAssignTitle',
    defaultMessage: 'Unassign user from the project',
  },
  unassignModalText: {
    id: 'UnassignModal.modalText',
    defaultMessage:
      "Are you sure you want to unassign user '<b>{user}</b>' from the project '<b>{project}</b>'?",
  },
  addProject: {
    id: 'projectsAndRolesColumn.addProject',
    defaultMessage: '+ Add Project',
  },
  assignToProject: {
    id: 'projectsAndRolesColumn.assignToProject',
    defaultMessage: 'Assign to project',
  },
});
@connect(null, {
  showNotification,
  showModalAction,
  fetchAllUsersAction,
  toggleUserRoleFormAction,
})
@track()
@injectIntl
export class ProjectsAndRolesColumn extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    className: PropTypes.string.isRequired,
    value: PropTypes.object,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
    showNotification: PropTypes.func.isRequired,
    showModalAction: PropTypes.func.isRequired,
    fetchAllUsersAction: PropTypes.func,
    toggleUserRoleFormAction: PropTypes.func,
  };
  static defaultProps = {
    value: {},
    fetchAllUsersAction: () => {},
    toggleUserRoleFormAction: () => {},
  };
  state = {
    assignRole: false,
    isMobileView: false,
  };

  componentDidMount() {
    this.match = window.matchMedia(SCREEN_XS_MAX_MEDIA);
    this.match.addListener(this.setMobileView);
    this.setMobileView(this.match);
  }

  componentWillUnmount() {
    if (!this.match) {
      return;
    }
    this.match.removeListener(this.setMobileView);
  }
  onChange = (project, role) => {
    const {
      intl,
      value: { userId },
    } = this.props;
    fetch(URLS.project(project), {
      method: 'put',
      data: { users: { [userId]: role } },
    })
      .then(() => {
        this.props.showNotification({
          message: intl.formatMessage(messages.updateUserRole, {
            user: userId,
          }),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
        this.props.fetchAllUsersAction();
      })
      .catch((err) => {
        this.props.showNotification({
          message: err.message,
          type: NOTIFICATION_TYPES.ERROR,
        });
      });
  };
  onAssignProjectRole = (project, role) => {
    const {
      intl,
      value: { userId },
    } = this.props;
    fetch(URLS.userInviteInternal(project), {
      method: 'put',
      data: { userNames: { [userId]: role } },
    })
      .then(() => {
        this.props.showNotification({
          message: intl.formatMessage(messages.updateUserRole, {
            user: userId,
          }),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
        this.props.fetchAllUsersAction();
      })
      .catch((err) => {
        this.props.showNotification({
          message: err.message,
          type: NOTIFICATION_TYPES.ERROR,
        });
      });
  };
  onDelete = (project) => {
    const {
      value: { userId },
    } = this.props;
    this.showUnassignModal(project, userId);
  };
  setMobileView = (media) =>
    media.matches !== this.state.isMobileView &&
    this.setState({
      isMobileView: media.matches,
    });
  getProjectsList = () => {
    const {
      value: { assignedProjects = {} },
    } = this.props;
    return Object.keys(assignedProjects);
  };

  getVisibleProjects = () => this.getProjectsList().slice(0, 2);
  getHiddenProjects = () => this.getProjectsList().slice(2);
  toggleExpand = () => {
    const {
      value: { userId, expandRoleSelection = false },
      tracking,
    } = this.props;
    if (!expandRoleSelection) {
      tracking.trackEvent(ADMIN_ALL_USERS_PAGE_EVENTS.PROJECT_AND_ROLES_BTN);
    }
    this.props.toggleUserRoleFormAction(userId, !expandRoleSelection);
  };
  toggleAssignRole = () => {
    this.props.tracking.trackEvent(ADMIN_ALL_USERS_PAGE_EVENTS.ADD_BTN_PROJECT_AND_ROLES);
    this.setState({
      assignRole: true,
    });
  };

  countHiddenProjects = () => this.getHiddenProjects().length;
  showHiddenCounter = () => this.countHiddenProjects() > 0;
  showUnassignModal = (project, user) => {
    const { tracking, intl } = this.props;
    tracking.trackEvent(ADMIN_ALL_USERS_PAGE_EVENTS.UNASSIGN_BTN_CLICK);
    this.props.showModalAction({
      id: 'confirmationModal',
      data: {
        message: intl.formatMessage(messages.unassignModalText, {
          user,
          project,
        }),
        onConfirm: () => this.unassignAction(project, user),
        title: intl.formatMessage(messages.unAssignTitle),
        confirmText: intl.formatMessage(messages.btnTitle),
        cancelText: intl.formatMessage(COMMON_LOCALE_KEYS.CANCEL),
        dangerConfirm: true,
        eventsInfo: {
          confirmBtn: ADMIN_ALL_USERS_PAGE_EVENTS.UNASSIGN_BTN_UNASSIGN_USER_MODAL,
          closeIcon: ADMIN_ALL_USERS_PAGE_EVENTS.CLOSE_ICON_UNASSIGN_USER_MODAL,
          cancelBtn: ADMIN_ALL_USERS_PAGE_EVENTS.CANCEL_BTN_UNASSIGN_USER_MODAL,
        },
      },
    });
  };
  handleAssignToProject = () => {
    this.toggleExpand();
    this.toggleAssignRole();
  };

  unassignAction = (projectId, userId) => {
    const { intl } = this.props;
    fetch(URLS.userUnasign(projectId), {
      method: 'put',
      data: { userNames: [userId] },
    })
      .then(() => {
        this.toggleExpand();
        this.props.showNotification({
          message: intl.formatMessage(messages.anassignUser),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
        this.props.fetchAllUsersAction();
      })
      .catch((err) => {
        this.props.showNotification({
          message: err.message,
          type: NOTIFICATION_TYPES.ERROR,
        });
      });
  };
  renderAssignToProjectButton = () => (
    <GhostButton tiny onClick={this.handleAssignToProject}>
      + {this.props.intl.formatMessage(messages.assignToProject)}
    </GhostButton>
  );
  renderVisibleProjectsList = () => {
    const arr = this.getVisibleProjects();
    return arr.map((project) => (
      <span key={project} className={cx('project')} onClick={this.toggleExpand}>
        {project}
      </span>
    ));
  };
  renderVisibleProjectsListMobile = () => {
    const arr = this.getVisibleProjects();
    return this.renderProjectListMobile(arr);
  };
  renderFullProjectsListMobile = () => {
    const arr = this.getProjectsList();
    return this.renderProjectListMobile(arr);
  };
  renderProjectListMobile = (arr = []) => {
    const {
      value: { assignedProjects = {} },
    } = this.props;
    return arr.map((project) => (
      <div key={project}>
        {project}, {assignedProjects[project].projectRole}
      </div>
    ));
  };
  renderDropdown = () => {
    const {
      value: { assignedProjects = {}, userId, accountType },
    } = this.props;
    return this.getProjectsList().map((key) => {
      const { projectRole, entryType } = assignedProjects[key];
      return (
        <RolesRow
          key={key}
          project={key}
          value={projectRole}
          onChange={this.onChange}
          onDelete={this.onDelete}
          userId={userId}
          entryType={entryType}
          accountType={accountType}
        />
      );
    });
  };
  renderHiddenProjectsCounter = () => (
    <span className={cx('show-more-projects')} onClick={this.toggleExpand}>
      + {this.countHiddenProjects()}
      <span className={cx('mobile-label')}>
        <FormattedMessage id={'ProjectsAndRolesColumn.more'} defaultMessage={'more'} />
      </span>
    </span>
  );
  render() {
    const {
      className,
      value: { expandRoleSelection },
    } = this.props;
    const { assignRole, isMobileView } = this.state;
    return (
      <div className={cx('projects-and-roles-col', className)}>
        <span className={cx('mobile-label', 'projects-and-roles-mobile-label')}>
          <FormattedMessage
            id={'AllUsersGrid.projectsAndRolesCol'}
            defaultMessage={'Projects and roles'}
          />
        </span>
        {isMobileView ? (
          <div className={cx('mobile-projects-list')}>
            {expandRoleSelection ? (
              this.renderFullProjectsListMobile()
            ) : (
              <React.Fragment>
                {this.renderVisibleProjectsListMobile()}
                {this.showHiddenCounter() && this.renderHiddenProjectsCounter()}
              </React.Fragment>
            )}
          </div>
        ) : (
          <Manager>
            <Reference>
              {({ ref }) => (
                <div ref={ref}>
                  {this.getProjectsList().length ? (
                    <React.Fragment>
                      {this.renderVisibleProjectsList()}
                      {this.showHiddenCounter() && this.renderHiddenProjectsCounter()}
                    </React.Fragment>
                  ) : (
                    this.renderAssignToProjectButton()
                  )}
                </div>
              )}
            </Reference>
            {expandRoleSelection &&
              ReactDOM.createPortal(
                <Popper
                  positionFixed={false}
                  modifiers={{ preventOverflow: { enabled: false } }}
                  placement="bottom"
                  hide={false}
                >
                  {({ placement, ref, style }) => (
                    <div
                      ref={ref}
                      style={style}
                      data-placement={placement}
                      className={cx('projects-and-roles-popover')}
                    >
                      <Fragment>
                        {this.renderDropdown()}
                        {assignRole && (
                          <RolesRow
                            onAssignProjectRole={this.onAssignProjectRole}
                            onDelete={this.onDelete}
                            createNew
                          />
                        )}
                      </Fragment>
                      <div className={cx('projects-and-roles-toolbar')}>
                        <div
                          className={cx(
                            'projects-and-roles-toolbar-item',
                            'projects-and-roles-toolbar-cancel-button',
                          )}
                          onClick={this.toggleExpand}
                        >
                          <FormattedMessage {...COMMON_LOCALE_KEYS.CANCEL} />
                        </div>
                        <div
                          onClick={this.toggleAssignRole}
                          className={cx(
                            'projects-and-roles-toolbar-item',
                            'projects-and-roles-toolbar-add-button',
                            {
                              'projects-and-roles-toolbar-add-button-disabled': assignRole,
                            },
                          )}
                        >
                          <FormattedMessage {...messages.addProject} />
                        </div>
                      </div>
                    </div>
                  )}
                </Popper>,
                document.querySelector('#popover-root'),
              )}
          </Manager>
        )}
      </div>
    );
  }
}
