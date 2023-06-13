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
import classNames from 'classnames/bind';
import { redirect } from 'redux-first-router';
import { instanceTypeSelector } from 'controllers/appInfo/selectors';
import { LOGIN_PAGE, REGISTRATION_PAGE } from 'controllers/pages';
import { SAAS } from 'controllers/appInfo/constants';
import { GhostButton } from 'components/buttons/ghostButton';
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

  const instanceType = useSelector(instanceTypeSelector);

  const onLoginClick = () => {
    dispatch(redirect({ type: LOGIN_PAGE }));
  };

  const onSignupClick = () => {
    dispatch(redirect({ type: REGISTRATION_PAGE }));
  };

  return (
    <div className={cx('account-removed-page')}>
      <div className={cx('content')}>
        <Image className={cx('logo')} src={Logo} />
        <Image className={cx('image')} src={DeleteAccountImg} />
        <div className={cx('header')}>{formatMessage(messages.header)}</div>
        <div className={cx('description')}>{formatMessage(messages.description)}</div>
        <div className={cx('message')}>{formatMessage(messages.message)}</div>
        <div className={cx('buttons-block')}>
          <GhostButton transparentBackground onClick={onLoginClick}>
            {formatMessage(messages.login)}
          </GhostButton>
          {instanceType === SAAS && (
            <GhostButton transparentBackground onClick={onSignupClick}>
              {formatMessage(messages.signup)}
            </GhostButton>
          )}
        </div>
      </div>
    </div>
  );
};
