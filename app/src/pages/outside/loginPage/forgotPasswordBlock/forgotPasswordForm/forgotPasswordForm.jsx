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

import { PureComponent } from 'react';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { redirect } from 'redux-first-router';
import { FormattedMessage, injectIntl, intlShape, defineMessages } from 'react-intl';
import { showScreenLockAction, hideScreenLockAction } from 'controllers/screenLock';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import Link from 'redux-first-router-link';
import PropTypes from 'prop-types';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { InputOutside } from 'components/inputs/inputOutside';
import { BigButton } from 'components/buttons/bigButton';
import { validate, fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { LOGIN_PAGE } from 'controllers/pages';
import EmailIcon from './img/email-icon-inline.svg';
import styles from './forgotPasswordForm.scss';

const cx = classNames.bind(styles);

const placeholders = defineMessages({
  email: {
    id: 'ForgotPasswordForm.emailPlaceholder',
    defaultMessage: 'Enter email',
  },
});
const notifications = defineMessages({
  successSendEmail: {
    id: 'ForgotPasswordForm.successSendEmail',
    defaultMessage: 'Password recovery instructions have been sent to email { email }',
  },
  errorSendEmail: {
    id: 'ForgotPasswordForm.errorSendEmail',
    defaultMessage: 'User with entered email address is not found',
  },
});

@connect(null, {
  showScreenLockAction,
  hideScreenLockAction,
  showNotification,
  redirect,
})
@reduxForm({
  form: 'forgotPassword',
  validate: ({ email }) => ({
    email: !validate.email(email) && 'emailHint',
  }),
})
@injectIntl
export class ForgotPasswordForm extends PureComponent {
  static propTypes = {
    intl: intlShape.isRequired,
    showScreenLockAction: PropTypes.func.isRequired,
    hideScreenLockAction: PropTypes.func.isRequired,
    showNotification: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    redirect: PropTypes.func.isRequired,
  };

  static defaultProps = {
    intl: {},
  };

  submitForm = ({ email }) => {
    this.props.showScreenLockAction();
    fetch(URLS.userPasswordRestore(), {
      method: 'post',
      data: {
        email,
      },
    })
      .then(() => {
        this.props.showNotification({
          type: NOTIFICATION_TYPES.SUCCESS,
          message: this.props.intl.formatMessage(notifications.successSendEmail, { email }),
        });
        this.props.redirect({ type: LOGIN_PAGE });
      })
      .catch(() => {
        this.props.showNotification({
          type: NOTIFICATION_TYPES.ERROR,
          message: this.props.intl.formatMessage(notifications.errorSendEmail),
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
      <form className={cx('forgot-password-form')} onSubmit={handleSubmit(this.submitForm)}>
        <div className={cx('email-field')}>
          <FieldProvider name="email">
            <FieldErrorHint>
              <InputOutside icon={EmailIcon} placeholder={formatMessage(placeholders.email)} />
            </FieldErrorHint>
          </FieldProvider>
        </div>
        <div className={cx('forgot-password-buttons-container')}>
          <div className={cx('forgot-password-button')}>
            <Link to={{ type: LOGIN_PAGE }} className={cx('button-link')}>
              <BigButton type={'button'} roundedCorners color={'gray-60'}>
                <FormattedMessage id={'ForgotPasswordForm.cancel'} defaultMessage={'Cancel'} />
              </BigButton>
            </Link>
          </div>
          <div className={cx('forgot-password-button')}>
            <BigButton type={'submit'} roundedCorners color={'organish'}>
              <FormattedMessage id={'ForgotPasswordForm.sendEmail'} defaultMessage={'Send email'} />
            </BigButton>
          </div>
        </div>
      </form>
    );
  }
}
