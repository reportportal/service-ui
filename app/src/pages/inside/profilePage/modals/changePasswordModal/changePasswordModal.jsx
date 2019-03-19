import React, { Component } from 'react';
import track from 'react-tracking';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { ModalLayout, withModal, ModalField } from 'components/main/modal';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { validate } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { reduxForm } from 'redux-form';
import { Input } from 'components/inputs/input';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import { PROFILE_PAGE_EVENTS } from 'components/main/analytics/events';
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
@injectIntl
@reduxForm({
  form: 'changePasswordForm',
  validate: ({ oldPassword, newPassword, confirmPassword }) => ({
    oldPassword: (!oldPassword || !validate.password(oldPassword)) && 'profilePassword',
    newPassword: (!newPassword || !validate.password(newPassword)) && 'profilePassword',
    confirmPassword: newPassword !== confirmPassword && 'profileConfirmPassword',
  }),
})
@track()
export class ChangePasswordModal extends Component {
  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    data: PropTypes.shape({
      onChangePassword: PropTypes.func,
    }).isRequired,
    intl: intlShape.isRequired,
    invalid: PropTypes.bool.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };
  state = {
    showPassword: false,
  };
  onChangeShowPassword = () => {
    this.setState({ showPassword: !this.state.showPassword });
  };
  changePasswordAndCloseModal = (closeModal) => (formData) => {
    this.props.data.onChangePassword(formData);
    closeModal();
  };
  render() {
    const { intl, invalid, handleSubmit, tracking } = this.props;
    const okButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.SUBMIT),
      onClick: (closeModal) => {
        tracking.trackEvent(PROFILE_PAGE_EVENTS.SUBMIT_BTN_CHANGE_PASSWORD_MODAL);
        handleSubmit(this.changePasswordAndCloseModal(closeModal))();
      },
      disabled: invalid,
    };
    const cancelButton = {
      text: intl.formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      eventInfo: PROFILE_PAGE_EVENTS.CANCEL_BTN_CHANGE_PASSWORD_MODAL,
    };
    return (
      <ModalLayout
        title={intl.formatMessage(messages.header)}
        okButton={okButton}
        cancelButton={cancelButton}
        closeIconEventInfo={PROFILE_PAGE_EVENTS.CLOSE_ICON_CHANGE_PASSWORD_MODAL}
      >
        <form className={cx('form')}>
          <ModalField
            label={intl.formatMessage(messages.oldPasswordLabel)}
            labelWidth={LABEL_WIDTH}
          >
            <FieldProvider name="oldPassword">
              <FieldErrorHint>
                <Input
                  placeholder={intl.formatMessage(messages.oldPasswordPlaceholder)}
                  type={this.state.showPassword ? 'text' : 'password'}
                  maxLength="128"
                />
              </FieldErrorHint>
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
                  maxLength="128"
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
                  maxLength="128"
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
