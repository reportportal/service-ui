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
import track from 'react-tracking';
import { commonValidators } from 'common/utils/validation';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { isDemoInstanceSelector } from 'controllers/appInfo';
import { loginAction, lastFailedLoginTimeSelector, badCredentialsSelector } from 'controllers/auth';
import { LOGIN_PAGE } from 'controllers/pages';
import {
  LOGIN,
  LOGIN_PAGE_EVENTS,
} from 'components/main/analytics/events/ga4Events/loginPageEvents';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { InputOutside } from 'components/inputs/inputOutside';
import { BigButton } from 'components/buttons/bigButton';
import { FieldProvider } from 'components/fields/fieldProvider';
import LoginIcon from 'common/img/login-field-icon-inline.svg';
import PasswordIcon from 'common/img/password-field-icon-inline.svg';
import { DEFAULT_USER_CREDENTIALS } from './constants';
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
  loginAttemptsExceededMessage: {
    id: 'LoginForm.loginAttemptsExceededMessage',
    defaultMessage:
      'You entered incorrectly login or password many times. <br />Login form is blocked for',
  },
  loginAttemptsExceededTime: {
    id: 'LoginForm.loginAttemptsExceededTime',
    defaultMessage: '{time} sec.',
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
    lastFailedLoginTime: lastFailedLoginTimeSelector(state),
    badCredentials: badCredentialsSelector(state),
    isDemoInstance: isDemoInstanceSelector(state),
  }),
  {
    authorize: loginAction,
  },
)
@reduxForm({
  form: 'loginPage',
  validate: ({ login, password }) => ({
    login: commonValidators.login(login),
    password: commonValidators.oldPassword(password),
  }),
})
@track()
@injectIntl
export class LoginForm extends React.Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    authorize: PropTypes.func.isRequired,
    lastFailedLoginTime: PropTypes.number,
    badCredentials: PropTypes.bool.isRequired,
    form: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired,
    isDemoInstance: PropTypes.bool,
    initialize: PropTypes.func.isRequired,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    lastFailedLoginTime: null,
    isDemoInstance: false,
  };

  constructor(props) {
    super(props);
    this.state = this.calculateLoginLimitState();
  }

  componentDidMount() {
    const { isDemoInstance, initialize } = this.props;

    if (isDemoInstance) {
      initialize(DEFAULT_USER_CREDENTIALS);
    }
  }

  componentDidUpdate(prevProps) {
    const { badCredentials, isDemoInstance, initialize } = this.props;

    if (prevProps.lastFailedLoginTime !== this.props.lastFailedLoginTime) {
      this.blockLoginForm();
    }

    if (badCredentials !== prevProps.badCredentials && badCredentials) {
      this.badCredentialsHandler();
    }

    if (isDemoInstance !== prevProps.isDemoInstance && isDemoInstance) {
      initialize(DEFAULT_USER_CREDENTIALS);
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

  clickEventHandler = () => {
    const { tracking } = this.props;
    tracking.trackEvent(LOGIN_PAGE_EVENTS.clickOnLoginButton(LOGIN));
  };

  render() {
    const {
      intl: { formatMessage },
      handleSubmit,
      authorize,
    } = this.props;
    const { blockTime, isLoginLimitExceeded } = this.state;

    return (
      <form className={cx('login-form')} onSubmit={handleSubmit(authorize)}>
        {!isLoginLimitExceeded ? (
          <>
            <div className={cx('login-field')}>
              <FieldProvider name="login">
                <FieldErrorHint provideHint={false}>
                  <InputOutside
                    icon={LoginIcon}
                    placeholder={formatMessage(messages.login)}
                    maxLength="128"
                    hasDynamicValidation
                    provideErrorHint
                  />
                </FieldErrorHint>
              </FieldProvider>
            </div>
            <div className={cx('password-field')}>
              <FieldProvider name="password">
                <FieldErrorHint provideHint={false}>
                  <InputOutside
                    icon={PasswordIcon}
                    placeholder={formatMessage(messages.password)}
                    type="password"
                    hasDynamicValidation
                    provideErrorHint
                    autoComplete="off"
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
            <div className={cx('login-button-container')}>
              <BigButton
                roundedCorners
                type="submit"
                color={'organish'}
                onClick={this.clickEventHandler}
              >
                {formatMessage(COMMON_LOCALE_KEYS.LOGIN)}
              </BigButton>
            </div>
          </>
        ) : (
          <div className={cx('attempts-exceeded-block')}>
            <div className={cx('attempts-exceeded-block-content')}>
              <span>{Parser(formatMessage(messages.loginAttemptsExceededMessage))}</span>
              <span className={cx('time')}>
                <b>
                  {Parser(formatMessage(messages.loginAttemptsExceededTime, { time: blockTime }))}
                </b>
              </span>
            </div>
            <Link
              to={{ type: LOGIN_PAGE, payload: { query: { forgotPass: 'true' } } }}
              className={cx('forgot-pass', 'attempts-exceed')}
            >
              <FormattedMessage id={'LoginForm.forgotPass'} defaultMessage={'Forgot password?'} />
            </Link>
          </div>
        )}
      </form>
    );
  }
}
