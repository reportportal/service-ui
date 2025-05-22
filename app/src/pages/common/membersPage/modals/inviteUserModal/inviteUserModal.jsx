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
import { Checkbox, Modal, FieldText, Tooltip } from '@reportportal/ui-kit';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { EDITOR, VIEWER } from 'common/constants/projectRoles';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils/fetch';
import { commonValidators } from 'common/utils/validation';
import { urlOrganizationSlugSelector } from 'controllers/pages';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { withModal, ModalField } from 'components/main/modal';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { hideModalAction, showModalAction } from 'controllers/modal';
import { ssoUsersOnlySelector } from 'controllers/appInfo';
import { activeOrganizationIdSelector } from 'controllers/organization/selectors';
import { MEMBERS_PAGE_EVENTS } from 'components/main/analytics/events';
import { projectInfoIdSelector, projectNameSelector } from 'controllers/project';
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
  headerAssignUserModal: {
    id: 'InviteUserModal.headerAssignUserModal',
    defaultMessage: 'Assign user',
  },
  description: {
    id: 'InviteUserModal.description',
    defaultMessage:
      'Please note, users new to the organization will join it with “Member” role, whereas existing users will maintain their current organizational role.',
  },
  email: {
    id: 'InviteUserModal.email',
    defaultMessage: 'Email',
  },
  descriptionAssign: {
    id: 'InviteUserModal.descriptionAssign',
    defaultMessage: 'Assign user to the project',
  },
  inputPlaceholder: {
    id: 'InviteUserModal.inputPlaceholder',
    defaultMessage: 'Enter email (e.g. example@mail.com)',
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
});

const inviteFormSelector = formValueSelector(INVITE_USER_FORM);

@withModal('inviteUserModal')
@injectIntl
@connect(
  (state) => ({
    projectName: projectNameSelector(state),
    selectedUser: inviteFormSelector(state, 'user'),
    ssoUsersOnly: ssoUsersOnlySelector(state),
    organizationSlug: urlOrganizationSlugSelector(state),
    organizationId: activeOrganizationIdSelector(state),
    projectId: projectInfoIdSelector(state),
  }),
  {
    showModalAction,
    hideModalAction,
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
    }).isRequired,
    handleSubmit: PropTypes.func.isRequired,
    showModalAction: PropTypes.func.isRequired,
    hideModalAction: PropTypes.func.isRequired,
    showNotification: PropTypes.func.isRequired,
    showDefaultErrorNotification: PropTypes.func.isRequired,
    selectedUser: PropTypes.object,
    ssoUsersOnly: PropTypes.bool,
    dirty: PropTypes.bool,
    projectName: PropTypes.string.isRequired,
    organizationSlug: PropTypes.string.isRequired,
    invalid: PropTypes.bool.isRequired,
    anyTouched: PropTypes.bool.isRequired,
    organizationId: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
  };

  static defaultProps = {
    intl: {},
    showModalAction: () => {},
    selectedUser: {},
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

  inviteUser = async (data) => {
    const {
      intl: { formatMessage },
      data: { onInvite },
    } = this.props;

    return fetch(URLS.userInvitations(), {
      method: 'post',
      data,
    })
      .then((res) => {
        this.props.showNotification({
          message: formatMessage(messages.memberWasInvited, {
            b: (innerData) => DOMPurify.sanitize(`<b>${innerData}</b>`),
            name: res.full_name,
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
    const { organizationId, projectId } = this.props;

    const userData = {
      email: data.email,
      organizations: [
        {
          id: organizationId,
          projects: [
            {
              id: projectId,
              project_role: data.canEdit ? EDITOR : VIEWER,
            },
          ],
        },
      ],
    };

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

  render() {
    const {
      intl,
      handleSubmit,
      projectName,
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
        <p className={cx('modal-description')}>
          {intl.formatMessage(ssoUsersOnly ? messages.descriptionAssign : messages.description)}
        </p>
        <form className={cx('invite-form')}>
          <ModalField
            label={intl.formatMessage(messages.email)}
            className={cx('label')}
            noMinHeight
          >
            <FieldProvider name="email" type="email">
              <FieldErrorHint provideHint={false}>
                <FieldText
                  maxLength={'128'}
                  placeholder={intl.formatMessage(messages.email)}
                  defaultWidth={false}
                />
              </FieldErrorHint>
            </FieldProvider>
          </ModalField>
          <ModalField className={cx('modal-field')}>
            <div className={cx('checkbox-wrapper')}>
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
            </div>
          </ModalField>
        </form>
      </Modal>
    );
  }
}
