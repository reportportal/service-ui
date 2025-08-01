/*
 * Copyright 2025 EPAM Systems
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
import { defineMessages, useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useTracking } from 'react-tracking';
import classNames from 'classnames/bind';
import { getFormValues, reduxForm } from 'redux-form';
import { Modal, FieldText, SystemMessage, Checkbox } from '@reportportal/ui-kit';
import { FieldElement } from 'pages/inside/projectSettingsPageContainer/content/elements';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { FieldProvider } from 'components/fields/fieldProvider';
import { ClipboardButton } from 'components/buttons/copyClipboardButton';
import { commonValidators } from 'common/utils/validation';
import { NOTIFICATION_TYPES, showNotification } from 'controllers/notification';
import { withModal } from 'components/main/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { InstanceAssignment } from 'pages/inside/common/assignments/instanceAssignment';
import { hideModalAction } from 'controllers/modal';
import { ALL_USERS_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/allUsersPage';
import { URLS } from 'common/urls';
import { ADMINISTRATOR, USER } from 'common/constants/accountRoles';
import { OrganizationType } from 'controllers/organization';
import styles from './createUserModal.scss';

const cx = classNames.bind(styles);

const FULL_NAME_FIELD = 'fullName';
const EMAIL_FIELD = 'email';
const PASSWORD_FIELD = 'password';
const ADMIN_RIGHTS = 'adminRights';
const CREATE_USER_FORM = 'createUserForm';
const ORGANIZATIONS = 'organizations';

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
      'Minimum 8 characters: at least one digit, one special symbol, one uppercase, and one lowercase letter',
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
    defaultMessage: 'User has been created successfully.',
  },
});

export const CreateUserModal = ({ handleSubmit, invalid }) => {
  const { trackEvent } = useTracking();
  const formValues = useSelector((state) => getFormValues(CREATE_USER_FORM)(state)) || {};
  const fields = useSelector((state) => state.form[CREATE_USER_FORM]?.fields) || {};
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();

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
    const { fullName, email, adminRights, password, organizations } = formData;
    trackEvent(ALL_USERS_PAGE_EVENTS.createUser(adminRights));
    hideModal();

    try {
      const response = await createUserResponse({ fullName, email, adminRights, password });

      if (response.status === 201) {
        dispatch(
          showNotification({
            message: formatMessage(messages.createdSuccessfully),
            type: NOTIFICATION_TYPES.SUCCESS,
          }),
        );

        const assignPromises = organizations.map((organization) =>
          assignOrganization({ email, organization }),
        );
        await Promise.all(assignPromises);
      }
    } catch {
      /* empty */
    }
  };

  const isSomeFieldFilled = Object.values(formValues).some((value) => !!value);
  const isTouched = Object.keys(fields).some(
    (field) => field !== ADMIN_RIGHTS && fields[field].touched,
  );

  return (
    <Modal
      title={formatMessage(messages.createUserTitle)}
      okButton={{
        children: formatMessage(COMMON_LOCALE_KEYS.CREATE),
        onClick: () => {
          handleSubmit(onCreateUser)();
        },
        disabled: isTouched && invalid,
      }}
      cancelButton={{
        children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      }}
      onClose={hideModal}
      className={cx('modal')}
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
                  helpText={formatMessage(messages.passwordValidateMessage)}
                  classNameHelpText={cx('help-text')}
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
        <FieldElement name={ORGANIZATIONS}>
          <InstanceAssignment />
        </FieldElement>
      </form>
    </Modal>
  );
};

CreateUserModal.propTypes = {
  handleSubmit: PropTypes.func,
  invalid: PropTypes.bool.isRequired,
};

export default withModal('createUserModal')(
  reduxForm({
    form: CREATE_USER_FORM,
    validate: ({ fullName, email, password }) => {
      return {
        [FULL_NAME_FIELD]: commonValidators.createPatternCreateUserNameValidator()(
          fullName?.trim(),
        ),
        [EMAIL_FIELD]: commonValidators.emailCreateUserValidator()(email?.trim()),
        [PASSWORD_FIELD]: commonValidators.createPatternCreateUserPasswordValidator()(
          password?.trim(),
        ),
      };
    },
  })(CreateUserModal),
);
