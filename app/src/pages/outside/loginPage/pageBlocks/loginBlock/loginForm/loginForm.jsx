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

import {useCallback, useEffect, useReducer, useRef} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import {useDispatch, useSelector} from 'react-redux';
import {reduxForm, stopSubmit} from 'redux-form';
import {defineMessages, FormattedMessage, useIntl} from 'react-intl';
import Link from 'redux-first-router-link';
import {useTracking} from 'react-tracking';
import {FieldText} from '@reportportal/ui-kit';
import {commonValidators} from 'common/utils/validation';
import {COMMON_LOCALE_KEYS} from 'common/constants/localization';
import {isDemoInstanceSelector} from 'controllers/appInfo';
import {
  badCredentialsSelector,
  clearLoginLockoutAction,
  lastFailedLoginTimeSelector,
  loginAction,
  loginLoadingSelector,
} from 'controllers/auth';
import {getLoginLockoutState} from 'controllers/auth/loginLockout';
import {LOGIN_PAGE} from 'controllers/pages';
import {LOGIN, LOGIN_PAGE_EVENTS,} from 'components/main/analytics/events/ga4Events/loginPageEvents';
import {FieldErrorHint} from 'components/fields/fieldErrorHint';
import {BigButton} from 'components/buttons/bigButton';
import {LoadingSubmitButton} from 'components/loadingSubmitButton';
import {FieldProvider} from 'components/fields/fieldProvider';
import {DEFAULT_USER_CREDENTIALS} from './constants';
import styles from './loginForm.scss';

const cx = classNames.bind(styles);

const BoldBlockTime = (parts) => <b className={cx('attempts-exceeded-count')}>{parts}</b>;

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
    defaultMessage: 'You entered an incorrect login or password many times.',
  },
  loginAttemptsExceededBlockedFor: {
    id: 'LoginForm.loginAttemptsExceededBlockedFor',
    defaultMessage: 'Login form is blocked for <bold>{seconds, number}</bold> sec.',
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

const LoginFormComponent = ({ handleSubmit, initialize, form }) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();

  const lastFailedLoginTime = useSelector(lastFailedLoginTimeSelector);
  const badCredentials = useSelector(badCredentialsSelector);
  const isLoginLoading = useSelector(loginLoadingSelector);
  const isDemoInstance = useSelector(isDemoInstanceSelector);

  const [, forceCountdownTick] = useReducer((tick) => tick + 1, 0);
  const prevBadCredentialsRef = useRef(badCredentials);

  const { blockTime, isLoginLimitExceeded } = getLoginLockoutState(lastFailedLoginTime);

  useEffect(() => {
    if (!lastFailedLoginTime) {
      return undefined;
    }

    if (!isLoginLimitExceeded) {
      dispatch(clearLoginLockoutAction());
      return undefined;
    }

    const intervalId = setInterval(() => {
      forceCountdownTick();
    }, 1000);

    return () => clearInterval(intervalId);
  }, [dispatch, isLoginLimitExceeded, lastFailedLoginTime]);

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
    if (isLoginLoading) {
      return;
    }

    trackEvent(LOGIN_PAGE_EVENTS.clickOnLoginButton(LOGIN));
  };

  const onLoginSubmit = useCallback(
    (values) => {
      if (isLoginLoading) {
        return;
      }

      dispatch(loginAction(values));
    },
    [dispatch, isLoginLoading],
  );

  return (
       <form
      className={cx('login-form', { 'login-form--lockout': isLoginLimitExceeded })}
      onSubmit={handleSubmit(onLoginSubmit)}
    >
      {!isLoginLimitExceeded ? (
        <>
          <div className={cx('login-field')}>
            <FieldProvider name="login">
              <FieldErrorHint provideHint={false} suppressError={isLoginLoading}>
                <FieldText
                  label={formatMessage(messages.login)}
                  maxLength={128}
                  defaultWidth={false}
                  disabled={isLoginLoading}
                  displayError={!isLoginLoading}
                />
              </FieldErrorHint>
            </FieldProvider>
          </div>
          <div className={cx('password-field')}>
            <FieldProvider name="password">
              <FieldErrorHint provideHint={false} suppressError={isLoginLoading}>
                <FieldText
                  label={formatMessage(messages.password)}
                  type="password"
                  maxLength={256}
                  defaultWidth={false}
                  autoComplete="off"
                  disabled={isLoginLoading}
                  displayError={!isLoginLoading}
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
              disabled={isLoginLoading}
              onClick={clickEventHandler}
            >
              <LoadingSubmitButton isLoading={isLoginLoading}>
                {formatMessage(COMMON_LOCALE_KEYS.LOGIN)}
              </LoadingSubmitButton>
            </BigButton>
          </div>
        </>
      ) : (
        <div className={cx('attempts-exceeded-block')}>
          <h2 className={cx('attempts-exceeded-heading')}>
            {formatMessage(messages.loginAttemptsExceededHeading)}
          </h2>
          <p className={cx('attempts-exceeded-message')}>
            {formatMessage(messages.loginAttemptsExceededMessage)}
          </p>
          <p className={cx('attempts-exceeded-message')}>
            {formatMessage(messages.loginAttemptsExceededBlockedFor, {
              seconds: blockTime,
              bold: BoldBlockTime,
            })}
          </p>
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
