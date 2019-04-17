/*
 * Copyright 2017 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/reportportal/service-ui
 *
 * Report Portal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Report Portal is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Report Portal.  If not, see <http://www.gnu.org/licenses/>.
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { redirect } from 'redux-first-router';
import classNames from 'classnames/bind';
import { FormattedMessage, injectIntl, intlShape, defineMessages } from 'react-intl';
import { validate, fetch, connectRouter } from 'common/utils';
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
    password: (!password || !validate.password(password)) && 'passwordHint',
    passwordRepeat: (!passwordRepeat || passwordRepeat !== password) && 'confirmPasswordHint',
  }),
})
@injectIntl
export class ChangePasswordForm extends PureComponent {
  static propTypes = {
    intl: intlShape.isRequired,
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
                  defaultMessage={'4-25 symbols'}
                />
              }
            >
              <FieldErrorHint>
                <InputOutside
                  type={'password'}
                  icon={PasswordIcon}
                  maxLength={'25'}
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
                maxLength={'25'}
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
