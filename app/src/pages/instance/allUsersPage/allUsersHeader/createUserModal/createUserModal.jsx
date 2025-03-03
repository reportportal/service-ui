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

import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames/bind';
import { getFormValues, reduxForm } from 'redux-form';
import { Modal, FieldText, SystemMessage, Checkbox } from '@reportportal/ui-kit';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { FieldProvider } from 'components/fields/fieldProvider';
import { ClipboardButton } from 'components/buttons/copyClipboardButton';
import { commonValidators } from 'common/utils/validation';
import { withModal } from 'components/main/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { hideModalAction } from 'controllers/modal';
import styles from './createUserModal.scss';

const cx = classNames.bind(styles);

const FULL_NAME_FIELD = 'fullName';
const EMAIL_FIELD = 'email';
const PASSWORD_FIELD = 'password';
const ADMIN_RIGHTS = 'adminRights';
const CREATE_USER_FORM = 'createUserForm';

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
});

export const CreateUserModal = ({ data = {}, handleSubmit, anyTouched, invalid }) => {
  const formValues = useSelector((state) => getFormValues(CREATE_USER_FORM)(state));
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const { onSubmit } = data;

  const hideModal = () => dispatch(hideModalAction());

  const onCreateUser = (formData) => {
    // In the second part of the task, the function will be added
    onSubmit?.(formData);
    hideModal();
  };

  return (
    <Modal
      title={formatMessage(messages.createUserTitle)}
      okButton={{
        children: formatMessage(COMMON_LOCALE_KEYS.CREATE),
        onClick: () => {
          handleSubmit(onCreateUser)();
        },
        disabled: anyTouched && invalid,
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
    >
      <div className={cx('modal-content')}>
        <SystemMessage>{formatMessage(messages.description)}</SystemMessage>
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
    </Modal>
  );
};

CreateUserModal.propTypes = {
  data: PropTypes.object,
  handleSubmit: PropTypes.func,
  anyTouched: PropTypes.bool.isRequired,
  invalid: PropTypes.bool.isRequired,
};

export default withModal('createUserModal')(
  reduxForm({
    form: CREATE_USER_FORM,
    validate: ({ fullName, email, password }) => {
      return {
        [FULL_NAME_FIELD]: commonValidators.createPatternUserCreateNameValidator()(
          fullName?.trim(),
        ),
        [EMAIL_FIELD]: commonValidators.email(email?.trim()),
        [PASSWORD_FIELD]: commonValidators.createPatternUserCreatePasswordValidator()(
          password?.trim(),
        ),
      };
    },
  })(CreateUserModal),
);
