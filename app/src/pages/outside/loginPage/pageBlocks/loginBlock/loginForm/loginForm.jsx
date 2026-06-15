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

import { useCallback, useEffect, useReducer, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { useDispatch, useSelector } from 'react-redux';
import { reduxForm, stopSubmit } from 'redux-form';
import { FormattedMessage, useIntl, defineMessages } from 'react-intl';
import Link from 'redux-first-router-link';
import { useTracking } from 'react-tracking';
import { FieldText } from '@reportportal/ui-kit';
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
import { BigButton } from 'components/buttons/bigButton';
import { FieldProvider } from 'components/fields/fieldProvider';
import { DEFAULT_USER_CREDENTIALS } from './constants';
import styles from './loginForm.scss';

const cx = classNames.bind(styles);

const LOGIN_LIMIT_EXCEEDED_BLOCK_DURATION = 30;

const messages = defineMessages({
  login: {
    id: 'LoginForm.loginPlaceholder',
    defaultMessage: 'Email',
  },
  password: {
    id: 'LoginForm.passwordPlaceholder',
    defaultMessage: 'Password',
  },
  loginAttemptsExceededHeading: {
    id: 'LoginForm.loginAttemptsExceededHeading',
    defaultMessage: 'Hold on for a while...',
  },
  loginAttemptsExceededMessage: {
    id: 'LoginForm.loginAttemptsExceededMessage',
    defaultMessage: 'You entered incorrectly login or password many times.',
  },
  loginAttemptsExceededBlockedFor: {
    id: 'LoginForm.loginAttemptsExceededBlockedFor',
    defaultMessage: 'Login form is blocked for',
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
    defaultMessage: 'Bad credentials',
  },
});

const getLoginLimitState = (lastFailedLoginTime) => {
  if (!lastFailedLoginTime) {
    return { blockTime: null, isLoginLimitExceeded: false };
  }

  const loginExceededDuration = Number(((Date.now() - lastFailedLoginTime) / 1000).toFixed());
  const isLoginLimitExceeded = loginExceededDuration <= LOGIN_LIMIT_EXCEEDED_BLOCK_DURATION;

  return {
    blockTime: isLoginLimitExceeded ? LOGIN_LIMIT_EXCEEDED_BLOCK_DURATION - loginExceededDuration : null,
    isLoginLimitExceeded,
  };
};

const LoginFormComponent = ({ handleSubmit, initialize, form }) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();

  const lastFailedLoginTime = useSelector(lastFailedLoginTimeSelector);
  const badCredentials = useSelector(badCredentialsSelector);
  const isDemoInstance = useSelector(isDemoInstanceSelector);

  const [, forceCountdownTick] = useReducer((tick) => tick + 1, 0);
  const prevBadCredentialsRef = useRef(badCredentials);

  const { blockTime, isLoginLimitExceeded } = getLoginLimitState(lastFailedLoginTime);

  useEffect(() => {
    if (!isLoginLimitExceeded) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      forceCountdownTick();
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isLoginLimitExceeded, lastFailedLoginTime]);

  useEffect(() => {
    if (isDemoInstance) {
      initialize(DEFAULT_USER_CREDENTIALS);
    }
  }, [initialize, isDemoInstance]);

  useEffect(() => {
    if (badCredentials && !prevBadCredentialsRef.current) {
      dispatch(
        stopSubmit(form, {
          login: formatMessage(messages.badCredentials),
          password: formatMessage(messages.badCredentials),
        }),
      );
    }

    prevBadCredentialsRef.current = badCredentials;
  }, [badCredentials, dispatch, form, formatMessage]);

  const clickEventHandler = () => {
    trackEvent(LOGIN_PAGE_EVENTS.clickOnLoginButton(LOGIN));
  };

  const onLoginSubmit = useCallback(
    (values) => dispatch(loginAction(values)),
    [dispatch],
  );

  return (
    <form className={cx('login-form')} onSubmit={handleSubmit(onLoginSubmit)}>
      {!isLoginLimitExceeded ? (
        <>
          <div className={cx('login-field')}>
            <FieldProvider name="login">
              <FieldErrorHint provideHint={false}>
                <FieldText
                  label={formatMessage(messages.login)}
                  type="email"
                  maxLength={128}
                  defaultWidth={false}
                />
              </FieldErrorHint>
            </FieldProvider>
          </div>
          <div className={cx('password-field')}>
            <FieldProvider name="password">
              <FieldErrorHint provideHint={false}>
                <FieldText
                  label={formatMessage(messages.password)}
                  type="password"
                  defaultWidth={false}
                  autoComplete="off"
                />
              </FieldErrorHint>
            </FieldProvider>
          </div>
          <Link
            to={{ type: LOGIN_PAGE, payload: { query: { forgotPass: 'true' } } }}
            className={cx('forgot-pass')}
          >
            <FormattedMessage id={'LoginForm.forgotPass'} defaultMessage={'Forgot your password?'} />
          </Link>
          <div className={cx('login-button-container')}>
            <BigButton
              className={cx('login-button')}
              roundedCorners
              type="submit"
              color={'base-topaz'}
              onClick={clickEventHandler}
            >
              {formatMessage(COMMON_LOCALE_KEYS.LOGIN)}
            </BigButton>
          </div>
        </>
      ) : (
        <div className={cx('attempts-exceeded-block')}>
          <p className={cx('attempts-exceeded-heading')}>
            {formatMessage(messages.loginAttemptsExceededHeading)}
          </p>
          <div className={cx('attempts-exceeded-block-content')}>
            <span>{formatMessage(messages.loginAttemptsExceededMessage)}</span>
            <span className={cx('blocked-for-line')}>
              {formatMessage(messages.loginAttemptsExceededBlockedFor)}{' '}
              <b>{formatMessage(messages.loginAttemptsExceededTime, { time: blockTime })}</b>
            </span>
          </div>
          <Link
            to={{ type: LOGIN_PAGE, payload: { query: { forgotPass: 'true' } } }}
            className={cx('forgot-pass', 'attempts-exceed')}
          >
            <FormattedMessage id={'LoginForm.forgotPass'} defaultMessage={'Forgot your password?'} />
          </Link>
        </div>
      )}
    </form>
  );
};

LoginFormComponent.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  initialize: PropTypes.func.isRequired,
  form: PropTypes.string.isRequired,
};

export const LoginForm = reduxForm({
  form: 'loginPage',
  validate: ({ login, password }) => ({
    login: commonValidators.login(login),
    password: commonValidators.oldPassword(password),
  }),
})(LoginFormComponent);
