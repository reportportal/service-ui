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

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { redirect } from 'redux-first-router';
import classNames from 'classnames/bind';
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl';
import { fetch, connectRouter } from 'common/utils';
import { commonValidators } from 'common/utils/validation';
import { URLS } from 'common/urls';
import { LOGIN_PAGE } from 'controllers/pages';
import { showScreenLockAction, hideScreenLockAction } from 'controllers/screenLock';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { FieldBottomConstraints } from 'components/fields/fieldBottomConstraints';
import { InputOutside } from 'components/inputs/inputOutside';
import { BigButton } from 'components/buttons/bigButton';
import PasswordIcon from './img/password-icon-inline.svg';
import styles from './changePasswordForm.scss';

const cx = classNames.bind(styles);

const placeholders = defineMessages({
  newPassword: {
    id: 'ChangePasswordForm.newPasswordPlaceholder',
    defaultMessage: 'New password',
  },
  confirmNewPassword: {
    id: 'ChangePasswordForm.newPasswordConfirmPlaceholder',
    defaultMessage: 'Confirm new password',
  },
});
const notifications = defineMessages({
  successChange: {
    id: 'ChangePasswordForm.successChange',
    defaultMessage: 'Your password has been changed successfully',
  },
  failedChange: {
    id: 'ChangePasswordForm.failedChange',
    defaultMessage: 'Failed to update password',
  },
});

@connectRouter(({ reset: resetQueryParam }) => ({ resetQueryParam }))
@connect(null, {
  redirect,
  showScreenLockAction,
  hideScreenLockAction,
  showNotification,
})
@reduxForm({
  form: 'changePassword',
  validate: ({ password, passwordRepeat }) => ({
    password: commonValidators.password(password),
    passwordRepeat: (!passwordRepeat || passwordRepeat !== password) && 'confirmPasswordHint',
  }),
})
@injectIntl
export class ChangePasswordForm extends PureComponent {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    showScreenLockAction: PropTypes.func.isRequired,
    hideScreenLockAction: PropTypes.func.isRequired,
    showNotification: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    resetQueryParam: PropTypes.string,
    redirect: PropTypes.func.isRequired,
  };
  static defaultProps = {
    resetQueryParam: '',
  };
  state = {
    loading: false,
  };
  changePassword = ({ password }) => {
    this.props.showScreenLockAction();
    const uuid = this.props.resetQueryParam;
    fetch(URLS.userPasswordReset(), {
      method: 'post',
      data: {
        password,
        uuid,
      },
    })
      .then(() => {
        this.props.showNotification({
          type: NOTIFICATION_TYPES.SUCCESS,
          message: this.props.intl.formatMessage(notifications.successChange),
        });
        this.props.redirect({ type: LOGIN_PAGE });
      })
      .catch(() => {
        this.props.showNotification({
          type: NOTIFICATION_TYPES.ERROR,
          message: this.props.intl.formatMessage(notifications.failedChange),
        });
      })
      .then(() => {
        this.props.hideScreenLockAction();
      });
  };

  render() {
    const { intl, handleSubmit } = this.props;
    const { formatMessage } = intl;
    return (
      <form className={cx('change-password-form')} onSubmit={handleSubmit(this.changePassword)}>
        <div className={cx('new-password-field')}>
          <FieldProvider name="password">
            <FieldBottomConstraints
              text={
                <FormattedMessage
                  id={'ChangePasswordForm.passwordConstraints'}
                  defaultMessage={'4-256 symbols'}
                />
              }
            >
              <FieldErrorHint>
                <InputOutside
                  type={'password'}
                  icon={PasswordIcon}
                  maxLength={'256'}
                  placeholder={formatMessage(placeholders.newPassword)}
                />
              </FieldErrorHint>
            </FieldBottomConstraints>
          </FieldProvider>
        </div>
        <div className={cx('confirm-new-password-field')}>
          <FieldProvider name="passwordRepeat">
            <FieldErrorHint>
              <InputOutside
                type={'password'}
                icon={PasswordIcon}
                maxLength={'256'}
                placeholder={formatMessage(placeholders.confirmNewPassword)}
              />
            </FieldErrorHint>
          </FieldProvider>
        </div>
        <div className={cx('change-password-button')}>
          <BigButton type={'submit'} color={'organish'}>
            <FormattedMessage
              id={'ChangePasswordForm.changePassword'}
              defaultMessage={'Change password'}
            />
          </BigButton>
        </div>
      </form>
    );
  }
}
