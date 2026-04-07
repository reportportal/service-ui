/*
 * Copyright 2026 EPAM Systems
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

import { useState } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, useIntl } from 'react-intl';
import { connect, useDispatch, useSelector } from 'react-redux';
import { useTracking } from 'react-tracking';
import classNames from 'classnames/bind';
import { getFormValues, reduxForm, FieldArray } from 'redux-form';
import { Modal, FieldText, SystemMessage, Checkbox } from '@reportportal/ui-kit';
import { fetch } from 'common/utils';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { FieldProvider } from 'components/fields/fieldProvider';
import { ClipboardButton } from 'components/buttons/copyClipboardButton';
import { commonValidators } from 'common/utils/validation';
import { passwordMinLengthSelector } from 'controllers/appInfo';
import {
  showSuccessNotification,
  showErrorNotification,
  showWarningNotification,
} from 'controllers/notification';
import { withModal } from 'components/main/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { InstanceAssignment } from 'pages/inside/common/assignments/instanceAssignment';
import { hideModalAction } from 'controllers/modal';
import { fetchAllUsersAction, ERROR_CODES } from 'controllers/instance/allUsers';
import { ALL_USERS_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/allUsersPage';
import { URLS } from 'common/urls';
import { ADMINISTRATOR, USER } from 'common/constants/accountRoles';
import { OrganizationType } from 'controllers/organization';
import {
  CREATE_USER_FORM,
  ORGANIZATIONS,
  ADMIN_RIGHTS,
  PASSWORD_FIELD,
  EMAIL_FIELD,
  FULL_NAME_FIELD,
} from './constants';
import styles from './createUserModal.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  createUserTitle: {
    id: 'CreateUserModal.title',
    defaultMessage: 'Create user',
  },
  description: {
    id: 'CreateUserModal.description',
    defaultMessage:
      'For security reasons, we recommend updating the password after the first login to the created account. Keep your data safe and secure with a new personalized password.',
  },
  fullName: {
    id: 'CreateUserModal.fullName',
    defaultMessage: 'Full name',
  },
  fullNamePlaceholder: {
    id: 'CreateUserModal.fullNamePlaceholder',
    defaultMessage: 'e.g. John Smith',
  },
  email: {
    id: 'CreateUserModal.email',
    defaultMessage: 'Email',
  },
  emailPlaceholder: {
    id: 'CreateUserModal.emailPlaceholder',
    defaultMessage: 'example@mail.com',
  },
  password: {
    id: 'CreateUserModal.password',
    defaultMessage: 'Password',
  },
  passwordPlaceholder: {
    id: 'CreateUserModal.passwordPlaceholder',
    defaultMessage: 'Enter password',
  },
  passwordValidateMessage: {
    id: 'CreateUserModal.passwordValidateMessage',
    defaultMessage:
      'Minimum {minLength} characters: at least one digit, one special symbol, one uppercase, and one lowercase letter',
  },
  provideAdminRights: {
    id: 'CreateUserModal.provideAdminRights',
    defaultMessage: 'Provide Admin rights',
  },
  invite: {
    id: 'CreateUserModal.invite',
    defaultMessage: 'Organizations and projects to invite',
  },
  inviteDescription: {
    id: 'CreateUserModal.inviteDescription',
    defaultMessage:
      'Add organizations and projects to specify where the invited user will have access',
  },
  createdSuccessfully: {
    id: 'CreateUserModal.createdSuccessfully',
    defaultMessage: 'User has been created successfully',
  },
  assignedSuccessfully: {
    id: 'CreateUserModal.assignedSuccessfully',
    defaultMessage: 'User has been assigned successfully',
  },
  assignAllFailed: {
    id: 'CreateUserModal.assignAllFailed',
    defaultMessage: 'Failed to assign to {failedOrgNames}',
  },
  assignPartialFailed: {
    id: 'CreateUserModal.assignPartialFailed',
    defaultMessage:
      '{fullName} has been successfully assigned to {successCount, plural, one {# organization} other {# organizations}}. Failed to assign to {failedOrgNames}',
  },
  createError: {
    id: 'CreateUserModal.createError',
    defaultMessage: 'Failed to create user',
  },
  userExistsDuplicate: {
    id: 'CreateUserModal.userExistsDuplicate',
    defaultMessage: "User with email={email} already exists. You couldn't create the duplicate",
  },
});

export const CreateUserModal = ({ handleSubmit, invalid }) => {
  const { trackEvent } = useTracking();
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const formValues = useSelector((state) => getFormValues(CREATE_USER_FORM)(state)) || {};
  const minLength = useSelector(passwordMinLengthSelector);
  const [isScrollDisabled, setIsScrollDisabled] = useState(false);

  const hideModal = () => dispatch(hideModalAction());

  const createUserResponse = async ({ fullName, email, adminRights, password }) => {
    return fetch(URLS.createUser(), {
      method: 'post',
      data: {
        email,
        full_name: fullName,
        instance_role: adminRights ? ADMINISTRATOR : USER,
        account_type: OrganizationType.INTERNAL,
        password,
        active: true,
      },
    });
  };

  const assignOrganization = async ({ email, organization: { role, projects, id } }) => {
    return fetch(URLS.userInvitations(), {
      method: 'post',
      data: {
        email,
        organizations: [
          {
            id,
            org_role: role,
            projects: projects?.map((project) => ({
              id: project.id,
              project_role: project.role,
            })),
          },
        ],
      },
    });
  };

  const onCreateUser = async (formData) => {
    const { fullName, email, adminRights, password, organizations = [] } = formData;
    trackEvent(ALL_USERS_PAGE_EVENTS.createUser(adminRights));

    try {
      const response = await createUserResponse({ fullName, email, adminRights, password });

      if (response.id) {
        hideModal();
        dispatch(showSuccessNotification({ message: formatMessage(messages.createdSuccessfully) }));

        const assignPromises = organizations.map((organization) =>
          assignOrganization({ email, organization }),
        );
        const results = await Promise.allSettled(assignPromises);
        const { failedNames, successCount } = results.reduce(
          (acc, res, idx) => {
            if (res.status === 'fulfilled') {
              acc.successCount += 1;
            } else {
              acc.failedNames.push(organizations[idx]?.name);
            }
            return acc;
          },
          { failedNames: [], successCount: 0 },
        );
        const failedOrgNames = failedNames.join(', ');

        if (failedNames.length === organizations.length) {
          dispatch(
            showErrorNotification({
              message: formatMessage(messages.assignAllFailed, { failedOrgNames }),
            }),
          );
        } else if (failedNames.length > 0) {
          dispatch(
            showWarningNotification({
              message: formatMessage(messages.assignPartialFailed, {
                fullName,
                successCount,
                failedOrgNames,
              }),
            }),
          );
        } else {
          dispatch(
            showSuccessNotification({ message: formatMessage(messages.assignedSuccessfully) }),
          );
        }

        dispatch(fetchAllUsersAction());
      }
    } catch (error) {
      let message = error?.message ?? formatMessage(messages.createError);
      if (error?.errorCode === ERROR_CODES.USER_EXISTS) {
        message = formatMessage(messages.userExistsDuplicate, { email: email || '' });
      }
      dispatch(showErrorNotification({ message }));
    }
  };

  const isSomeFieldFilled = Object.values(formValues).some((value) => !!value);

  return (
    <Modal
      title={formatMessage(messages.createUserTitle)}
      okButton={{
        children: formatMessage(COMMON_LOCALE_KEYS.CREATE),
        onClick: () => {
          handleSubmit(onCreateUser)();
        },
        disabled: invalid,
        tooltipNode: invalid && formatMessage(COMMON_LOCALE_KEYS.VALIDATION_TOOLTIP),
      }}
      cancelButton={{
        children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      }}
      onClose={hideModal}
      className={cx('modal', { 'scroll-disabled': isScrollDisabled })}
      footerNode={
        <FieldProvider name={ADMIN_RIGHTS} format={Boolean}>
          <Checkbox className={cx('checkbox')}>
            {formatMessage(messages.provideAdminRights)}
          </Checkbox>
        </FieldProvider>
      }
      allowCloseOutside={!isSomeFieldFilled}
      scrollable
    >
      <form className={cx('modal-content')}>
        <div className={cx('wrapper-message')}>
          <SystemMessage>{formatMessage(messages.description)}</SystemMessage>
        </div>
        <FieldProvider name={FULL_NAME_FIELD}>
          <FieldErrorHint provideHint={false}>
            <FieldText
              label={formatMessage(messages.fullName)}
              defaultWidth={false}
              placeholder={formatMessage(messages.fullNamePlaceholder)}
              isRequired
            />
          </FieldErrorHint>
        </FieldProvider>
        <div className={cx('fields-wrapper')}>
          <div className={cx('field-wrapper')}>
            <FieldProvider name={EMAIL_FIELD}>
              <FieldErrorHint provideHint={false}>
                <FieldText
                  label={formatMessage(messages.email)}
                  defaultWidth={false}
                  placeholder={formatMessage(messages.emailPlaceholder)}
                  isRequired
                />
              </FieldErrorHint>
            </FieldProvider>
            <ClipboardButton text={formValues?.[EMAIL_FIELD]} />
          </div>
          <div className={cx('field-wrapper')}>
            <FieldProvider name={PASSWORD_FIELD}>
              <FieldErrorHint provideHint={false}>
                <FieldText
                  label={formatMessage(messages.password)}
                  defaultWidth={false}
                  placeholder={formatMessage(messages.passwordPlaceholder)}
                  type="password"
                  helpText={formatMessage(messages.passwordValidateMessage, { minLength })}
                  classNameHelpText={cx('help-text')}
                  isRequired
                />
              </FieldErrorHint>
            </FieldProvider>
            <ClipboardButton text={formValues?.[PASSWORD_FIELD]} />
          </div>
        </div>
        <div className={cx('invite-wrapper')}>
          <span className={cx('invite')}>{formatMessage(messages.invite)}</span>
          <span className={cx('invite-description')}>
            {formatMessage(messages.inviteDescription)}
          </span>
        </div>
        <FieldArray
          name={ORGANIZATIONS}
          component={InstanceAssignment}
          props={{
            formName: CREATE_USER_FORM,
            formNamespace: 'organization',
            isOrganizationRequired: true,
            onMenuStateChange: setIsScrollDisabled,
          }}
        />
      </form>
    </Modal>
  );
};

CreateUserModal.propTypes = {
  handleSubmit: PropTypes.func,
  invalid: PropTypes.bool,
};

export default withModal('createUserModal')(
  connect((state) => ({ minLength: passwordMinLengthSelector(state) }))(
    injectIntl(
      reduxForm({
        form: CREATE_USER_FORM,
        validate: (
          { fullName, email, password, organization, organizations = [] },
          { minLength, intl },
        ) => {
          const errors = {};
          const passwordMessage = intl.formatMessage(messages.passwordValidateMessage, {
            minLength,
          });

          errors[FULL_NAME_FIELD] = commonValidators.createPatternCreateUserNameValidator()(
            fullName?.trim(),
          );
          errors[EMAIL_FIELD] = commonValidators.emailCreateUserValidator()(email?.trim());
          errors[PASSWORD_FIELD] = commonValidators.createPasswordValidator(
            minLength,
            passwordMessage,
          )(password?.trim());

          if (organizations.length === 0) {
            errors.organizations = commonValidators.requiredField();

            if (!organization?.name) {
              errors.organization = { name: commonValidators.requiredField() };
            }
          }

          return errors;
        },
      })(CreateUserModal),
    ),
  ),
);
