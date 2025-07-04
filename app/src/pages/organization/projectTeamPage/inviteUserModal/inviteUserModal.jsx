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
import classNames from 'classnames/bind';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { reduxForm } from 'redux-form';
import Parser from 'html-react-parser';
import DOMPurify from 'dompurify';
import { Checkbox, Modal, FieldText, Tooltip } from '@reportportal/ui-kit';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { EDITOR, VIEWER } from 'common/constants/projectRoles';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils/fetch';
import { commonValidators } from 'common/utils/validation';
import { showErrorNotification, showSuccessNotification } from 'controllers/notification';
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
import { ERROR_CODES, InvitationStatus, settingsLink, settingsLinkName } from './constants';
import { ExternalUserInvitationModal } from '../../../inside/common/modals/externalUserInvitationModal';
import { messages } from './messages';

const cx = classNames.bind(styles);

const INVITE_USER_FORM = 'inviteUserForm';

export const InviteUser = ({ data, handleSubmit, dirty, invalid, anyTouched }) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const projectName = useSelector(projectNameSelector);
  const ssoUsersOnly = useSelector(ssoUsersOnlySelector);
  const organizationId = useSelector(activeOrganizationIdSelector);
  const projectId = useSelector(projectInfoIdSelector);
  const header = ssoUsersOnly
    ? `${formatMessage(messages.headerAssignUserModal)} ${projectName}`
    : `${formatMessage(messages.headerInviteUserModal)} ${projectName}`;

  const getCloseConfirmationConfig = () => {
    if (dirty) {
      return null;
    }
    return {
      confirmationWarning: formatMessage(COMMON_LOCALE_KEYS.CLOSE_MODAL_WARNING),
    };
  };

  const inviteUser = async (userData) => {
    const { onInvite } = data;

    try {
      const invitedUser = await fetch(URLS.userInvitations(), {
        method: 'post',
        data: userData,
      });
      onInvite();

      return invitedUser;
    } catch (err) {
      const externalInviteForbidden = err.errorCode === ERROR_CODES.FORBIDDEN && ssoUsersOnly;
      const message = externalInviteForbidden
        ? formatMessage(messages.externalInviteForbidden, {
            email: userData.email,
            linkName: settingsLinkName,
            a: (innerData) =>
              DOMPurify.sanitize(
                `<a href="${settingsLink}" target="_blank" rel="noopener">${innerData}</a>`,
                { ADD_ATTR: ['target'] },
              ),
          })
        : err.message;

      dispatch(showErrorNotification({ message }));

      return {
        errorOccurred: true,
        ...err,
      };
    }
  };

  const inviteUserAndCloseModal = async (formData) => {
    const userData = {
      email: formData.email,
      organizations: [
        {
          id: organizationId,
          projects: [
            {
              id: projectId,
              project_role: formData.canEdit ? EDITOR : VIEWER,
            },
          ],
        },
      ],
    };

    const invitedUser = await inviteUser(userData);

    if (invitedUser?.errorOccurred) {
      return;
    }

    if (invitedUser?.status === InvitationStatus.PENDING) {
      dispatch(
        showModalAction({
          component: (
            <ExternalUserInvitationModal
              email={invitedUser.email}
              link={invitedUser.link}
              header={header}
            />
          ),
        }),
      );
    } else {
      dispatch(
        showSuccessNotification({
          message: formatMessage(messages.memberWasInvited, {
            b: (innerData) => DOMPurify.sanitize(`<b>${innerData}</b>`),
            name: invitedUser.full_name,
          }),
        }),
      );
      dispatch(hideModalAction());
    }
  };

  const okButton = {
    children: formatMessage(ssoUsersOnly ? COMMON_LOCALE_KEYS.ASSIGN : COMMON_LOCALE_KEYS.INVITE),
    onClick: () => {
      handleSubmit(inviteUserAndCloseModal)();
    },
    disabled: anyTouched && invalid,
    eventInfo: MEMBERS_PAGE_EVENTS.INVITE_BTN_INVITE_USER_MODAL,
    'data-automation-id': 'submitButton',
  };

  const cancelButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    eventInfo: MEMBERS_PAGE_EVENTS.CANCEL_BTN_INVITE_USER_MODAL,
    'data-automation-id': 'cancelButton',
  };

  return (
    <Modal
      title={header}
      okButton={okButton}
      cancelButton={cancelButton}
      onClose={() => dispatch(hideModalAction())}
      size="large"
      closeConfirmation={getCloseConfirmationConfig()}
    >
      <p className={cx('modal-description')}>
        {formatMessage(ssoUsersOnly ? messages.descriptionAssign : messages.description)}
      </p>
      <form className={cx('invite-form')}>
        <ModalField noMinHeight>
          <FieldProvider name="email">
            <FieldErrorHint provideHint={false}>
              <FieldText
                maxLength={'128'}
                placeholder={formatMessage(messages.inputPlaceholder)}
                defaultWidth={false}
                label={formatMessage(messages.email)}
                type="email"
              />
            </FieldErrorHint>
          </FieldProvider>
        </ModalField>
        <ModalField className={cx('modal-field')}>
          <div className={cx('checkbox-wrapper')}>
            <FieldProvider name="canEdit" format={Boolean}>
              <Checkbox className={cx('can-edit')}>
                {formatMessage(messages.canEditProject)}
              </Checkbox>
            </FieldProvider>
            <Tooltip
              content={formatMessage(messages.hintMessage)}
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
};

InviteUser.propTypes = {
  data: PropTypes.shape({
    onInvite: PropTypes.func,
  }).isRequired,
  handleSubmit: PropTypes.func.isRequired,
  dirty: PropTypes.bool.isRequired,
  invalid: PropTypes.bool.isRequired,
  anyTouched: PropTypes.bool.isRequired,
};

export const InviteUserModal = withModal('inviteUserModal')(
  reduxForm({
    form: INVITE_USER_FORM,
    validate: ({ email }) => ({
      email: commonValidators.emailCreateUserValidator()(email?.trim()),
    }),
    enableReinitialize: true,
  })(InviteUser),
);
