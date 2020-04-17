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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { defineMessages, injectIntl } from 'react-intl';
import { reduxForm, formValueSelector } from 'redux-form';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { DEFAULT_PROJECT_ROLE, ROLES_MAP } from 'common/constants/projectRoles';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils/fetch';
import { commonValidators } from 'common/utils/validation';
import { projectIdSelector } from 'controllers/pages';
import { isAdminSelector } from 'controllers/user';
import { showScreenLockAction, hideScreenLockAction } from 'controllers/screenLock';
import {
  showNotification,
  showDefaultErrorNotification,
  NOTIFICATION_TYPES,
} from 'controllers/notification';
import { withModal, ModalLayout, ModalField } from 'components/main/modal';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { showModalAction } from 'controllers/modal';
import { AsyncAutocomplete } from 'components/inputs/autocompletes/asyncAutocomplete';
import { InputDropdown } from 'components/inputs/inputDropdown';
import { MEMBERS_PAGE_EVENTS } from 'components/main/analytics/events';
import { InputUserSearch } from 'components/inputs/inputUserSearch';
import styles from './inviteUserModal.scss';

const cx = classNames.bind(styles);
const LABEL_WIDTH = 105;
const messages = defineMessages({
  headerInviteUserModal: {
    id: 'InviteUserModal.headerInviteUserModal',
    defaultMessage: 'Invite user',
  },
  description: {
    id: 'InviteUserModal.description',
    defaultMessage: 'Invite user to the project',
  },
  emailLabel: {
    id: 'InviteUserModal.emailLabel',
    defaultMessage: 'Login or email',
  },
  role: {
    id: 'InviteUserModal.role',
    defaultMessage: 'Project role',
  },
  inputPlaceholder: {
    id: 'InviteUserModal.inputPlaceholder',
    defaultMessage: 'Enter login or email',
  },
  memberWasInvited: {
    id: 'InviteUserModal.memberWasInvited',
    defaultMessage: "Member '<b>{name}</b>' was assigned to the project",
  },
  inviteExternalMember: {
    id: 'InviteUserModal.inviteExternalMember',
    defaultMessage:
      'Invite for member is successfully registered. Confirmation info will be send on provided email. Expiration: 1 day.',
  },
});

const inviteFormSelector = formValueSelector('inviteUserForm');

@withModal('inviteUserModal')
@injectIntl
@connect(
  (state, ownProps) => ({
    selectedProject: ownProps.data.isProjectSelector
      ? inviteFormSelector(state, 'project')
      : projectIdSelector(state),
    selectedUser: inviteFormSelector(state, 'user'),
    isAdmin: isAdminSelector(state),
    initialValues: {
      role: DEFAULT_PROJECT_ROLE,
      project: projectIdSelector(state),
    },
  }),
  {
    showModalAction,
    showScreenLockAction,
    hideScreenLockAction,
    showNotification,
    showDefaultErrorNotification,
  },
)
@reduxForm({
  form: 'inviteUserForm',
  validate: ({ user, project }) => ({
    user: commonValidators.requiredField(user),
    project: commonValidators.requiredField(project),
  }),
  enableReinitialize: true,
})
export class InviteUserModal extends Component {
  static propTypes = {
    intl: PropTypes.object,
    data: PropTypes.shape({
      onInvite: PropTypes.func,
      isProjectSelector: PropTypes.bool,
    }).isRequired,
    handleSubmit: PropTypes.func.isRequired,
    showModalAction: PropTypes.func.isRequired,
    showScreenLockAction: PropTypes.func.isRequired,
    hideScreenLockAction: PropTypes.func.isRequired,
    showNotification: PropTypes.func.isRequired,
    showDefaultErrorNotification: PropTypes.func.isRequired,
    selectedProject: PropTypes.string,
    selectedUser: PropTypes.object,
    isAdmin: PropTypes.bool,
    dirty: PropTypes.bool,
  };

  static defaultProps = {
    intl: {},
    showModalAction: () => {},
    selectedProject: '',
    selectedUser: {},
    isAdmin: false,
    dirty: false,
  };

  getCloseConfirmationConfig = () => {
    if (!this.props.dirty) {
      return null;
    }
    return {
      confirmationWarning: this.props.intl.formatMessage(COMMON_LOCALE_KEYS.CLOSE_MODAL_WARNING),
    };
  };

  inviteUser = (userData) => {
    const {
      intl: { formatMessage },
      data: { onInvite },
      selectedProject,
    } = this.props;
    const data = {};

    if (userData.user.externalUser) {
      data.defaultProject = selectedProject;
      data.email = userData.user.userLogin;
      data.role = userData.role;

      this.props.showScreenLockAction();
      return fetch(URLS.userInviteExternal(), {
        method: 'post',
        data,
      })
        .then((res) => {
          this.props.showNotification({
            message: formatMessage(messages.inviteExternalMember),
            type: NOTIFICATION_TYPES.SUCCESS,
          });
          onInvite();
          this.props.hideScreenLockAction();
          data.backLink = res.backLink;
          return data;
        })
        .catch((err) => {
          this.props.showDefaultErrorNotification(err);
          this.props.hideScreenLockAction();
          return {
            errorOccurred: true,
            ...err,
          };
        });
    }
    data.userNames = {
      [userData.user.userLogin]: userData.role,
    };

    return fetch(URLS.userInviteInternal(selectedProject), {
      method: 'put',
      data,
    })
      .then(() => {
        this.props.showNotification({
          message: formatMessage(messages.memberWasInvited, {
            name: userData.user.userLogin,
          }),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
        onInvite();
      })
      .catch((err) => {
        this.props.showDefaultErrorNotification(err);
        return {
          errorOccurred: true,
          ...err,
        };
      });
  };

  inviteUserAndCloseModal = (closeModal) => (data) => {
    this.inviteUser(data).then((res) => {
      if (res && res.errorOccurred) {
        return;
      }
      if (data.user.externalUser) {
        this.props.showModalAction({
          id: 'externalUserInvitationModal',
          data: { email: res.email, link: res.backLink },
        });
      } else {
        closeModal();
      }
    });
  };
  formatUser = (user) => (user && { value: user.userLogin, label: user.userLogin }) || null;

  filterProject = (value) =>
    !(
      value &&
      this.props.selectedUser &&
      this.props.selectedUser.assignedProjects &&
      this.props.selectedUser.assignedProjects[value]
    );

  render() {
    const { intl, handleSubmit, selectedProject, isAdmin, data } = this.props;

    const okButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.INVITE),
      onClick: (closeModal) => {
        handleSubmit(this.inviteUserAndCloseModal(closeModal))();
      },
      eventInfo: MEMBERS_PAGE_EVENTS.INVITE_BTN_INVITE_USER_MODAL,
    };
    const cancelButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      eventInfo: MEMBERS_PAGE_EVENTS.CANCEL_BTN_INVITE_USER_MODAL,
    };
    return (
      <ModalLayout
        title={intl.formatMessage(messages.headerInviteUserModal)}
        okButton={okButton}
        cancelButton={cancelButton}
        closeIconEventInfo={MEMBERS_PAGE_EVENTS.CLOSE_ICON_INVITE_USER_MODAL}
        closeConfirmation={this.getCloseConfirmationConfig()}
      >
        <p className={cx('modal-description')}>{intl.formatMessage(messages.description)}</p>
        <form className={cx('invite-form')}>
          <ModalField label={intl.formatMessage(messages.emailLabel)} labelWidth={LABEL_WIDTH}>
            <FieldProvider name="user" format={this.formatUser}>
              <FieldErrorHint>
                <InputUserSearch
                  projectId={selectedProject}
                  isAdmin={isAdmin}
                  placeholder={intl.formatMessage(messages.inputPlaceholder)}
                />
              </FieldErrorHint>
            </FieldProvider>
          </ModalField>
          {data.isProjectSelector && (
            <ModalField label="Project" name="project" labelWidth={LABEL_WIDTH}>
              <FieldProvider name="project">
                <FieldErrorHint hintType="top">
                  <AsyncAutocomplete
                    minLength={1}
                    getURI={URLS.projectNameSearch}
                    filterOption={this.filterProject}
                  />
                </FieldErrorHint>
              </FieldProvider>
            </ModalField>
          )}
          <ModalField label={intl.formatMessage(messages.role)} labelWidth={LABEL_WIDTH}>
            <FieldProvider name="role">
              <InputDropdown options={ROLES_MAP} />
            </FieldProvider>
          </ModalField>
        </form>
      </ModalLayout>
    );
  }
}
