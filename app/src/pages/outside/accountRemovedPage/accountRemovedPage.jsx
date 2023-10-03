/*
 * Copyright 2023 EPAM Systems
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
import { useDispatch, useSelector } from 'react-redux';
import { defineMessages, useIntl } from 'react-intl';
import { useTracking } from 'react-tracking';
import classNames from 'classnames/bind';
import { redirect } from 'redux-first-router';
import { instanceTypeSelector } from 'controllers/appInfo/selectors';
import { LOGIN_PAGE, REGISTRATION_PAGE } from 'controllers/pages';
import { SAAS } from 'controllers/appInfo/constants';
import { GhostButton } from 'components/buttons/ghostButton';
import { PROFILE_PAGE_EVENTS } from 'components/main/analytics/events';
import { Image } from 'components/main/image';
import Logo from 'common/img/logo.svg';
import DeleteAccountImg from './img/deleteAccount.png';
import styles from './accountRemovedPage.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  header: {
    id: 'AccountRemovedPage.header',
    defaultMessage: 'the account has been deleted',
  },
  description: {
    id: 'AccountRemovedPage.description',
    defaultMessage:
      "Your account and personal data have been deleted from ReportPortal database.\nWe're sorry to see you go. An email notification has been sent to the email address associated with your account.",
  },
  message: {
    id: 'AccountRemovedPage.message',
    defaultMessage: 'Thank you for using ReportPortal',
  },
  login: {
    id: 'AccountRemovedPage.login',
    defaultMessage: 'Log in',
  },
  signup: {
    id: 'AccountRemovedPage.signup',
    defaultMessage: 'Sign up',
  },
});

export const AccountRemovedPage = () => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { trackEvent } = useTracking();

  const instanceType = useSelector(instanceTypeSelector);
  // TODO EPMRPP-82466 remove "false &&" after SignUpPlugin release
  const isSaas = false && instanceType === SAAS;

  const onLoginClick = () => {
    trackEvent(PROFILE_PAGE_EVENTS.CLICK_LOG_IN);
    dispatch(redirect({ type: LOGIN_PAGE }));
  };

  const onSignupClick = () => {
    trackEvent(PROFILE_PAGE_EVENTS.CLICK_SIGN_UP);
    dispatch(redirect({ type: REGISTRATION_PAGE }));
  };

  return (
    <div className={cx('account-removed-page')}>
      <div className={cx('content')}>
        <Image className={cx('logo')} src={Logo} />
        <Image className={cx('image')} src={DeleteAccountImg} />
        <h1>{formatMessage(messages.header)}</h1>
        <p>{formatMessage(messages.description)}</p>
        <p>
          <b>{formatMessage(messages.message)}</b>
        </p>
        <div className={cx('buttons-block')}>
          <GhostButton transparentBackground onClick={onLoginClick}>
            {formatMessage(messages.login)}
          </GhostButton>
          {isSaas && (
            <GhostButton transparentBackground onClick={onSignupClick}>
              {formatMessage(messages.signup)}
            </GhostButton>
          )}
        </div>
      </div>
    </div>
  );
};
