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
import { defineMessages, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { ModalLayout, withModal, ModalField } from 'components/main/modal';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { commonValidators } from 'common/utils/validation';
import { passwordMinLengthSelector } from 'controllers/appInfo';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { validationLocalization } from 'common/constants/localization/validationLocalization';
import { ERROR_CODE_LOGIN_BAD_CREDENTIALS } from 'common/constants/apiErrorCodes';
import { reduxForm, SubmissionError } from 'redux-form';
import { Input } from 'components/inputs/input';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import classNames from 'classnames/bind';
import styles from './changePasswordModal.scss';

const LABEL_WIDTH = 90;
const cx = classNames.bind(styles);
const messages = defineMessages({
  header: {
    id: 'ChangePasswordModal.header',
    defaultMessage: 'Change password',
  },
  oldPasswordPlaceholder: {
    id: 'ChangePasswordModal.oldPasswordPlaceholder',
    defaultMessage: 'Enter old password',
  },
  newPasswordPlaceholder: {
    id: 'ChangePasswordModal.newPasswordPlaceholder',
    defaultMessage: 'Enter new password',
  },
  confirmPlaceholder: {
    id: 'ChangePasswordModal.confirmPlaceholder',
    defaultMessage: 'Confirm new password',
  },
  oldPasswordLabel: {
    id: 'ChangePasswordModal.oldPasswordLabel',
    defaultMessage: 'Old password',
  },
  newPasswordLabel: {
    id: 'ChangePasswordModal.newPasswordLabel',
    defaultMessage: 'New password',
  },
  confirmLabel: {
    id: 'ChangePasswordModal.confirmLabel',
    defaultMessage: 'Confirm',
  },
  showPassword: {
    id: 'ChangePasswordModal.showPassword',
    defaultMessage: 'Show password',
  },
});

@withModal('changePasswordModal')
@connect((state) => ({
  minLength: passwordMinLengthSelector(state),
}))
@injectIntl
@reduxForm({
  form: 'changePasswordForm',
  validate: ({ oldPassword, newPassword, confirmPassword }, { minLength, intl }) => {
    const passwordMessage = intl.formatMessage(validationLocalization.passwordHint, { minLength });
    const passwordValidator = commonValidators.createPasswordValidator(minLength, passwordMessage);

    return {
      oldPassword: commonValidators.oldPassword(oldPassword),
      newPassword: passwordValidator(newPassword),
      confirmPassword: newPassword !== confirmPassword && 'profileConfirmPassword',
    };
  },
})
export class ChangePasswordModal extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    data: PropTypes.shape({
      onChangePassword: PropTypes.func,
    }).isRequired,
    invalid: PropTypes.bool.isRequired,
    dirty: PropTypes.bool.isRequired,
  };

  state = {
    showPassword: false,
    isSubmitting: false,
  };

  onChangeShowPassword = () => {
    this.setState({ showPassword: !this.state.showPassword });
  };

  getCloseConfirmationConfig = () => {
    if (!this.props.dirty) {
      return null;
    }
    return {
      confirmationWarning: this.props.intl.formatMessage(COMMON_LOCALE_KEYS.CLOSE_MODAL_WARNING),
    };
  };

  isOldPasswordValidationError = (error) => {
    const status = error?.status || error?.response?.status;
    const field = error?.field || error?.fieldName;
    const code = error?.code || error?.errorCode;
    const message = String(error?.message || '').toLowerCase();
    const errorsPayload =
      error?.validationErrors || error?.errors || error?.violations || error?.details;

    const hasOldPasswordInArrayPayload =
      Array.isArray(errorsPayload) &&
      errorsPayload.some((item) => {
        const itemField = item?.field || item?.fieldName || item?.name || item?.path;
        return itemField === 'oldPassword';
      });

    const hasOldPasswordInObjectPayload =
      !!errorsPayload &&
      !Array.isArray(errorsPayload) &&
      typeof errorsPayload === 'object' &&
      Object.prototype.hasOwnProperty.call(errorsPayload, 'oldPassword');

    return (
      code === 'INVALID_OLD_PASSWORD' ||
      code === ERROR_CODE_LOGIN_BAD_CREDENTIALS ||
      field === 'oldPassword' ||
      message.includes('old password') ||
      message.includes('current password') ||
      ((status === 400 || status === '400') &&
        (hasOldPasswordInArrayPayload || hasOldPasswordInObjectPayload))
    );
  };

  changePasswordAndCloseModal = (closeModal) => (formData) => {
    if (this.state.isSubmitting) {
      return Promise.resolve();
    }

    this.setState({ isSubmitting: true });
    return this.props.data
      .onChangePassword(formData)
      .then(() => {
        closeModal();
      })
      .catch((error) => {
        const errorMessage = error?.message || 'Unexpected error';
        if (this.isOldPasswordValidationError(error)) {
          throw new SubmissionError({
            oldPassword: errorMessage,
          });
        }
        throw new SubmissionError({
          _error: errorMessage,
        });
      })
      .finally(() => {
        this.setState({ isSubmitting: false });
      });
  };

  render() {
    const { intl, invalid, handleSubmit } = this.props;
    const { isSubmitting } = this.state;
    const okButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.SUBMIT),
      onClick: (closeModal) => {
        handleSubmit(this.changePasswordAndCloseModal(closeModal))();
      },
      disabled: invalid || isSubmitting,
    };
    const cancelButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    };
    return (
      <ModalLayout
        title={intl.formatMessage(messages.header)}
        okButton={okButton}
        cancelButton={cancelButton}
        closeConfirmation={this.getCloseConfirmationConfig()}
      >
        <form className={cx('form')}>
          <ModalField
            label={intl.formatMessage(messages.oldPasswordLabel)}
            labelWidth={LABEL_WIDTH}
          >
            <FieldProvider name="oldPassword">
              <Input
                placeholder={intl.formatMessage(messages.oldPasswordPlaceholder)}
                type={this.state.showPassword ? 'text' : 'password'}
                maxLength="256"
              />
            </FieldProvider>
          </ModalField>
          <ModalField
            label={intl.formatMessage(messages.newPasswordLabel)}
            labelWidth={LABEL_WIDTH}
          >
            <FieldProvider name="newPassword">
              <FieldErrorHint>
                <Input
                  placeholder={intl.formatMessage(messages.newPasswordPlaceholder)}
                  type={this.state.showPassword ? 'text' : 'password'}
                  maxLength="256"
                />
              </FieldErrorHint>
            </FieldProvider>
          </ModalField>
          <ModalField label={intl.formatMessage(messages.confirmLabel)} labelWidth={LABEL_WIDTH}>
            <FieldProvider name="confirmPassword">
              <FieldErrorHint>
                <Input
                  placeholder={intl.formatMessage(messages.confirmPlaceholder)}
                  type={this.state.showPassword ? 'text' : 'password'}
                  maxLength="256"
                />
              </FieldErrorHint>
            </FieldProvider>
          </ModalField>
        </form>
        <div className={cx('show-password')}>
          <InputCheckbox value={this.state.showPassword} onChange={this.onChangeShowPassword} />
          <span className={cx('show-password-label')}>
            {intl.formatMessage(messages.showPassword)}
          </span>
        </div>
      </ModalLayout>
    );
  }
}
