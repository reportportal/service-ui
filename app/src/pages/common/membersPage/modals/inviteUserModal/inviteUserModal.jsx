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
import Parser from 'html-react-parser';
import DOMPurify from 'dompurify';
import { Checkbox, Modal, SystemMessage, Tooltip } from '@reportportal/ui-kit';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { EDITOR, MANAGER, VIEWER } from 'common/constants/projectRoles';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils/fetch';
import { commonValidators } from 'common/utils/validation';
import { urlOrganizationSlugSelector, urlProjectSlugSelector } from 'controllers/pages';
import { activeProjectSelector, isAdminSelector } from 'controllers/user';
import { showScreenLockAction, hideScreenLockAction } from 'controllers/screenLock';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { withModal, ModalField } from 'components/main/modal';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { hideModalAction, showModalAction } from 'controllers/modal';
import { Input } from 'components/inputs/input';
import { areUserSuggestionsAllowedSelector, ssoUsersOnlySelector } from 'controllers/appInfo';
import { AsyncAutocomplete } from 'components/inputs/autocompletes/asyncAutocomplete';
import { MEMBERS_PAGE_EVENTS } from 'components/main/analytics/events';
import { projectKeySelector, projectNameSelector } from 'controllers/project';
import { InputUserSearch, makeOptions } from 'components/inputs/inputUserSearch';
import { ADMINISTRATOR } from 'common/constants/accountRoles';
import HintIcon from './img/hint-inline.svg';
import styles from './inviteUserModal.scss';

const cx = classNames.bind(styles);

const INVITE_USER_FORM = 'inviteUserForm';

const messages = defineMessages({
  headerInviteUserModal: {
    id: 'InviteUserModal.headerInviteUserModal',
    defaultMessage: 'Invite user to',
  },
  canEditProject: {
    id: 'InviteUserModal.canEditProject',
    defaultMessage: 'Can edit the Project',
  },
  canEditTooltip: {
    id: 'InviteUserModal.canEditTooltip',
    defaultMessage:
      'The selected user has the Manager role in organization and will have ‘Can edit’ permissions in the project by default',
  },
  headerAssignUserModal: {
    id: 'InviteUserModal.headerAssignUserModal',
    defaultMessage: 'Assign user',
  },
  description: {
    id: 'InviteUserModal.description',
    defaultMessage:
      'Please note, users new to the organization will join it with “Member” role, whereas existing users will maintain their current organizational role.',
  },
  nameOrEmailLabel: {
    id: 'InviteUserModal.nameOrEmailLabel',
    defaultMessage: 'Name or email',
  },
  descriptionAssign: {
    id: 'InviteUserModal.descriptionAssign',
    defaultMessage: 'Assign user to the project',
  },
  loginOrEmailLabel: {
    id: 'InviteUserModal.loginOrEmailLabel',
    defaultMessage: 'Login or email',
  },
  emailLabel: {
    id: 'InviteUserModal.emailLabel',
    defaultMessage: 'Email',
  },
  inputPlaceholder: {
    id: 'InviteUserModal.inputPlaceholder',
    defaultMessage: 'Enter full name or email (e.g. example@mail.com)',
  },
  memberWasInvited: {
    id: 'InviteUserModal.memberWasInvited',
    defaultMessage: "User ''<b>{name}</b>'' has been invited and assigned successfully",
  },
  inviteExternalMember: {
    id: 'InviteUserModal.inviteExternalMember',
    defaultMessage:
      'Invite for member is successfully registered. Confirmation info will be send on provided email. Expiration: 1 day.',
  },
  hintMessage: {
    id: 'InviteUserModal.hintMessage',
    defaultMessage:
      "By default, invited users receive 'View only' permissions. Users with 'Can edit' permissions can modify the project and all its data (report launches, change defect types, etc.).",
  },
  inviteAdmin: {
    id: 'InviteUserModal.inviteAdmin',
    defaultMessage:
      'Be aware that the selected user, as an Admin, has full access to all organizations and projects within the instance, regardless of specified role and permissions.',
  },
});

const inviteFormSelector = formValueSelector(INVITE_USER_FORM);

@withModal('inviteUserModal')
@injectIntl
@connect(
  (state, ownProps) => ({
    selectedProject: ownProps.data.isProjectSelector
      ? inviteFormSelector(state, 'project') || activeProjectSelector(state)
      : urlProjectSlugSelector(state),
    projectName: projectNameSelector(state),
    selectedUser: inviteFormSelector(state, 'user'),
    isAdmin: isAdminSelector(state),
    projectKey: projectKeySelector(state),
    ssoUsersOnly: ssoUsersOnlySelector(state),
    initialValues: {
      canEdit: false,
      project: urlProjectSlugSelector(state),
    },
    areUserSuggestionsAllowed: areUserSuggestionsAllowedSelector(state),
    organizationSlug: urlOrganizationSlugSelector(state),
  }),
  {
    showModalAction,
    hideModalAction,
    showScreenLockAction,
    hideScreenLockAction,
    showNotification,
  },
)
@reduxForm({
  form: INVITE_USER_FORM,
  validate: ({ user, project, email }) => ({
    user: commonValidators.requiredField(user),
    project: commonValidators.requiredField(project),
    email: commonValidators.email(email),
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
    hideModalAction: PropTypes.func.isRequired,
    showScreenLockAction: PropTypes.func.isRequired,
    hideScreenLockAction: PropTypes.func.isRequired,
    showNotification: PropTypes.func.isRequired,
    showDefaultErrorNotification: PropTypes.func.isRequired,
    projectKey: PropTypes.string.isRequired,
    selectedProject: PropTypes.string,
    selectedUser: PropTypes.object,
    isAdmin: PropTypes.bool,
    ssoUsersOnly: PropTypes.bool,
    dirty: PropTypes.bool,
    areUserSuggestionsAllowed: PropTypes.bool.isRequired,
    projectName: PropTypes.string.isRequired,
    organizationSlug: PropTypes.string.isRequired,
    invalid: PropTypes.bool.isRequired,
    anyTouched: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    intl: {},
    showModalAction: () => {},
    selectedProject: '',
    selectedUser: {},
    isAdmin: false,
    ssoUsersOnly: false,
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
      projectKey,
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
          this.props.showNotification({
            message: err.message,
            type: NOTIFICATION_TYPES.ERROR,
          });
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

    return fetch(URLS.userInviteInternal(projectKey), {
      method: 'put',
      data,
    })
      .then(() => {
        this.props.showNotification({
          message: formatMessage(messages.memberWasInvited, {
            b: (innerData) => DOMPurify.sanitize(`<b>${innerData}</b>`),
            name: userData.user.userLogin,
          }),
          type: NOTIFICATION_TYPES.SUCCESS,
        });
        onInvite();
      })
      .catch((err) => {
        this.props.showNotification({
          message: err.message,
          type: NOTIFICATION_TYPES.ERROR,
        });
        return {
          errorOccurred: true,
          ...err,
        };
      });
  };

  inviteUserAndCloseModal = async (data) => {
    const {
      selectedProject,
      areUserSuggestionsAllowed,
      data: { isProjectSelector },
    } = this.props;
    const userData = {
      ...data,
      role: data.canEdit ? EDITOR : VIEWER,
    };

    if (!(isProjectSelector || areUserSuggestionsAllowed)) {
      const foundUsers = await fetch(URLS.projectUserSearchUser(selectedProject)(data.email));
      const foundUser = foundUsers?.content.find(({ email }) => email === data.email);
      if (foundUser) {
        userData.user = makeOptions(data.project, false)({ content: [foundUser] })[0];
      } else {
        userData.user = {
          userLogin: data.email,
          externalUser: true,
        };
      }
    }

    const res = await this.inviteUser(userData);
    if (res?.errorOccurred) {
      return;
    }
    if (userData.user.externalUser) {
      this.props.showModalAction({
        id: 'externalUserInvitationModal',
        data: { email: res.email, link: res.backLink },
      });
    } else {
      this.props.hideModalAction();
    }
  };

  formatUser = (user) => (user && { value: user.userLogin, label: user.userLogin }) || null;

  filterProject = (value) => !(value && this.props.selectedUser?.assignedProjects?.[value]);

  canEdit = () => {
    const { selectedUser, organizationSlug } = this.props;
    const role = selectedUser?.assignedOrganizations?.[organizationSlug]?.organizationRole;

    return selectedUser && role === MANAGER;
  };

  render() {
    const {
      intl,
      handleSubmit,
      isAdmin,
      data: { isProjectSelector },
      projectKey,
      projectName,
      areUserSuggestionsAllowed,
      selectedUser,
      anyTouched,
      invalid,
      ssoUsersOnly,
    } = this.props;

    const okButton = {
      children: intl.formatMessage(
        selectedUser?.userLogin && !selectedUser?.externalUser
          ? COMMON_LOCALE_KEYS.INVITE_AND_ASSIGN
          : COMMON_LOCALE_KEYS.INVITE,
      ),
      text: intl.formatMessage(
        ssoUsersOnly ? COMMON_LOCALE_KEYS.ASSIGN : COMMON_LOCALE_KEYS.INVITE,
      ),
      onClick: () => {
        handleSubmit(this.inviteUserAndCloseModal)();
      },
      disabled: anyTouched && invalid,
      eventInfo: MEMBERS_PAGE_EVENTS.INVITE_BTN_INVITE_USER_MODAL,
      'data-automation-id': 'submitButton',
    };

    const cancelButton = {
      children: intl.formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      eventInfo: MEMBERS_PAGE_EVENTS.CANCEL_BTN_INVITE_USER_MODAL,
      'data-automation-id': 'cancelButton',
    };

    return (
      <Modal
        title={
          ssoUsersOnly
            ? intl.formatMessage(messages.headerAssignUserModal)
            : `${intl.formatMessage(messages.headerInviteUserModal)} "${projectName}"`
        }
        okButton={okButton}
        cancelButton={cancelButton}
        onClose={this.props.hideModalAction}
        size="large"
        closeConfirmation={this.getCloseConfirmationConfig()}
      >
        {selectedUser?.userRole === ADMINISTRATOR && (
          <SystemMessage>{intl.formatMessage(messages.inviteAdmin)}</SystemMessage>
        )}
        <p className={cx('modal-description')}>
          {intl.formatMessage(ssoUsersOnly ? messages.descriptionAssign : messages.description)}
        </p>
        <form className={cx('invite-form')}>
          {isProjectSelector || areUserSuggestionsAllowed ? (
            <ModalField
              label={intl.formatMessage(messages.nameOrEmailLabel)}
              className={cx('label')}
              noMinHeight
            >
              <FieldProvider name="user" format={this.formatUser}>
                <FieldErrorHint active>
                  <InputUserSearch
                    isAdmin={isAdmin}
                    placeholder={intl.formatMessage(messages.inputPlaceholder)}
                    projectKey={projectKey}
                    creatable={!ssoUsersOnly}
                  />
                </FieldErrorHint>
              </FieldProvider>
            </ModalField>
          ) : (
            <ModalField label={intl.formatMessage(messages.emailLabel)}>
              <FieldProvider name="email" type="email">
                <FieldErrorHint>
                  <Input maxLength={'128'} placeholder={intl.formatMessage(messages.emailLabel)} />
                </FieldErrorHint>
              </FieldProvider>
            </ModalField>
          )}
          {isProjectSelector && (
            <ModalField label="Project" name="project">
              <FieldProvider name="project" dumbOnBlur>
                <AsyncAutocomplete
                  minLength={1}
                  getURI={URLS.projectNameSearch}
                  filterOption={this.filterProject}
                />
              </FieldProvider>
            </ModalField>
          )}
          <ModalField className={cx('modal-field')}>
            <div className={cx('checkbox-wrapper')}>
              {this.canEdit() ? (
                <div>
                  <Tooltip
                    content={intl.formatMessage(messages.canEditTooltip)}
                    placement="top"
                    contentClassName={cx('content-class')}
                    wrapperClassName={cx('wrapper-class')}
                  >
                    <Checkbox className={cx('can-edit-disabled')} disabled checked>
                      {intl.formatMessage(messages.canEditProject)}
                    </Checkbox>
                  </Tooltip>
                </div>
              ) : (
                <>
                  <FieldProvider name="canEdit" format={Boolean}>
                    <Checkbox className={cx('can-edit')}>
                      {intl.formatMessage(messages.canEditProject)}
                    </Checkbox>
                  </FieldProvider>
                  <Tooltip
                    content={intl.formatMessage(messages.hintMessage)}
                    placement="top"
                    contentClassName={cx('custom-tooltip')}
                    wrapperClassName={cx('tooltip-wrapper')}
                  >
                    <i className={cx('icon')}>{Parser(HintIcon)}</i>
                  </Tooltip>
                </>
              )}
            </div>
          </ModalField>
        </form>
      </Modal>
    );
  }
}
