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
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { connect } from 'react-redux';
import { reduxForm, stopSubmit } from 'redux-form';
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl';
import Link from 'redux-first-router-link';
import { isEmptyObject } from 'common/utils/isEmptyObject';
import { commonValidators } from 'common/utils/validation';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { authExtensionsSelector } from 'controllers/appInfo';
import { loginAction, lastFailedLoginTimeSelector, badCredentialsSelector } from 'controllers/auth';
import { LOGIN_PAGE } from 'controllers/pages';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { InputOutside } from 'components/inputs/inputOutside';
import { BigButton } from 'components/buttons/bigButton';
import { FieldProvider } from 'components/fields/fieldProvider';
import WarningIcon from 'common/img/error-inline.svg';
import LoginIcon from './img/login-field-icon-inline.svg';
import PasswordIcon from './img/password-field-icon-inline.svg';
import { ExternalLoginBlock } from './externalLoginBlock';
import styles from './loginForm.scss';

const cx = classNames.bind(styles);

const LOGIN_LIMIT_EXCEEDED_BLOCK_DURATION = 30;

const messages = defineMessages({
  login: {
    id: 'LoginForm.loginPlaceholder',
    defaultMessage: 'Login',
  },
  password: {
    id: 'LoginForm.passwordPlaceholder',
    defaultMessage: 'Password',
  },
  loginAttemptsExceeded: {
    id: 'LoginForm.loginAttemptsExceeded',
    defaultMessage:
      'You entered incorrectly login or password many times. Login form is blocked for <b>{time}</b> sec.',
  },
  errorMessage: {
    id: 'LoginForm.errorMessage',
    defaultMessage: 'Error',
  },
  badCredentials: {
    id: 'LoginForm.badCredentials',
    defaultMessage: 'Bad Credentials',
  },
});

@connect(
  (state) => ({
    externalAuth: authExtensionsSelector(state),
    lastFailedLoginTime: lastFailedLoginTimeSelector(state),
    badCredentials: badCredentialsSelector(state),
  }),
  {
    authorize: loginAction,
  },
)
@reduxForm({
  form: 'loginPage',
  validate: ({ login, password }) => ({
    login: commonValidators.login(login),
    password: commonValidators.password(password),
  }),
})
@injectIntl
export class LoginForm extends React.Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    authorize: PropTypes.func.isRequired,
    externalAuth: PropTypes.object,
    lastFailedLoginTime: PropTypes.number,
    badCredentials: PropTypes.bool.isRequired,
    form: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired,
  };

  static defaultProps = {
    externalAuth: {},
    lastFailedLoginTime: null,
  };

  constructor(props) {
    super(props);
    this.state = this.calculateLoginLimitState();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.lastFailedLoginTime !== this.props.lastFailedLoginTime) {
      this.blockLoginForm();
    }
    const { badCredentials } = this.props;
    if (badCredentials !== prevProps.badCredentials && badCredentials) {
      this.badCredentialsHandler();
    }
  }

  componentWillUnmount() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  getLoginExceededDuration = () => ((Date.now() - this.props.lastFailedLoginTime) / 1000).toFixed();

  blockLoginForm = () => {
    const data = this.calculateLoginLimitState();

    this.setState(data);
  };

  calculateLoginLimitState = () => {
    const loginExceededDuration = this.getLoginExceededDuration();
    const isLoginLimitExceeded = loginExceededDuration <= LOGIN_LIMIT_EXCEEDED_BLOCK_DURATION;
    let blockTime = null;

    if (isLoginLimitExceeded) {
      blockTime = LOGIN_LIMIT_EXCEEDED_BLOCK_DURATION - loginExceededDuration;
      this.blockFormCountdown(blockTime);
    }

    return {
      blockTime,
      isLoginLimitExceeded,
    };
  };

  blockFormCountdown = (seconds) => {
    let blockTime = seconds;
    this.intervalId = setInterval(() => {
      blockTime -= 1;
      if (blockTime <= 0) {
        clearInterval(this.intervalId);
        this.setState({
          isLoginLimitExceeded: false,
        });
      } else {
        this.setState({
          blockTime,
        });
      }
    }, 1000);
  };

  badCredentialsHandler = () => {
    const {
      form,
      dispatch,
      intl: { formatMessage },
    } = this.props;
    dispatch(
      stopSubmit(form, {
        login: formatMessage(messages.badCredentials),
        password: formatMessage(messages.badCredentials),
      }),
    );
  };

  render() {
    const {
      intl: { formatMessage },
      handleSubmit,
      externalAuth,
      authorize,
    } = this.props;
    const { blockTime, isLoginLimitExceeded } = this.state;

    return (
      <form className={cx('login-form')} onSubmit={handleSubmit(authorize)}>
        {!isEmptyObject(externalAuth) ? (
          <div>
            <ExternalLoginBlock externalAuth={externalAuth} />
            <div className={cx('separator')}>
              <div className={cx('line')} />
              <div className={cx('or')}>
                <FormattedMessage id={'LoginForm.or'} defaultMessage={'or'} />
              </div>
            </div>
          </div>
        ) : null}
        <div className={cx('login-field')}>
          <FieldProvider name="login">
            <FieldErrorHint>
              <InputOutside
                disabled={isLoginLimitExceeded}
                icon={LoginIcon}
                placeholder={formatMessage(messages.login)}
                maxLength="128"
              />
            </FieldErrorHint>
          </FieldProvider>
        </div>
        <div className={cx('password-field')}>
          <FieldProvider name="password">
            <FieldErrorHint>
              <InputOutside
                disabled={isLoginLimitExceeded}
                icon={PasswordIcon}
                placeholder={formatMessage(messages.password)}
                type="password"
              />
            </FieldErrorHint>
          </FieldProvider>
        </div>
        <Link
          to={{ type: LOGIN_PAGE, payload: { query: { forgotPass: 'true' } } }}
          className={cx('forgot-pass')}
        >
          <FormattedMessage id={'LoginForm.forgotPass'} defaultMessage={'Forgot password?'} />
        </Link>
        {isLoginLimitExceeded && (
          <div className={cx('attempts-exceeded-block')}>
            <span className={cx('warning')}>
              <i className={cx('warning-icon')}>{Parser(WarningIcon)}</i>
              {formatMessage(messages.errorMessage)}
            </span>
            <span>
              {Parser(formatMessage(messages.loginAttemptsExceeded, { time: blockTime }))}
            </span>
          </div>
        )}
        <div className={cx('login-button-container')}>
          <BigButton
            disabled={isLoginLimitExceeded}
            roundedCorners
            type="submit"
            color={'organish'}
          >
            {formatMessage(COMMON_LOCALE_KEYS.LOGIN)}
          </BigButton>
        </div>
      </form>
    );
  }
}
