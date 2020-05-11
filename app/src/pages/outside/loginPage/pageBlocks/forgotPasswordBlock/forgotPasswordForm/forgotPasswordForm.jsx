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

import { PureComponent } from 'react';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { redirect } from 'redux-first-router';
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl';
import { showScreenLockAction, hideScreenLockAction } from 'controllers/screenLock';
import {
  showNotification,
  showDefaultErrorNotification,
  NOTIFICATION_TYPES,
} from 'controllers/notification';
import Link from 'redux-first-router-link';
import PropTypes from 'prop-types';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { InputOutside } from 'components/inputs/inputOutside';
import { BigButton } from 'components/buttons/bigButton';
import { fetch } from 'common/utils/fetch';
import { commonValidators } from 'common/utils/validation';
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
});

@connect(null, {
  showScreenLockAction,
  hideScreenLockAction,
  showNotification,
  showDefaultErrorNotification,
  redirect,
})
@reduxForm({
  form: 'forgotPassword',
  validate: ({ email }) => ({
    email: commonValidators.email(email),
  }),
})
@injectIntl
export class ForgotPasswordForm extends PureComponent {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    showScreenLockAction: PropTypes.func.isRequired,
    hideScreenLockAction: PropTypes.func.isRequired,
    showNotification: PropTypes.func.isRequired,
    showDefaultErrorNotification: PropTypes.func.isRequired,
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
      .catch(this.props.showDefaultErrorNotification)
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
              <InputOutside
                icon={EmailIcon}
                autoComplete="off"
                placeholder={formatMessage(placeholders.email)}
              />
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
