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

import { useCallback, useState } from 'react';
import classNames from 'classnames/bind';
import { useDispatch } from 'react-redux';
import { defineMessages } from 'react-intl';
import { showDefaultErrorNotification } from 'controllers/notification';
import { fetch } from 'common/utils/fetch';
import { URLS } from 'common/urls';
import { PageSectionContainer } from 'pages/outside/common/pageSectionContainer';
import { OutsideLoginFooter } from 'pages/outside/common/outsideLoginFooter';
import { ForgotPasswordForm } from './forgotPasswordForm';
import { ForgotPasswordConfirmation } from './forgotPasswordForm/forgotPasswordConfirmation';
import styles from './forgotPasswordBlock.scss';

const messages = defineMessages({
  forgotPass: {
    id: 'ForgotPasswordBlock.forgotPass',
    defaultMessage: 'Restore password',
  },
  enterEmail: {
    id: 'ForgotPasswordBlock.enterEmail',
    defaultMessage: 'Enter your email address and we will send you the recovery link',
  },
  confirmationHint: {
    id: 'ForgotPasswordBlock.confirmationHint',
    defaultMessage:
      'We\u2019ve sent you an email to confirm your password change. Please check your inbox:',
  },
});

const cx = classNames.bind(styles);

export const ForgotPasswordBlock = () => {
  const dispatch = useDispatch();
  const [confirmation, setConfirmation] = useState(null);
  const [isResending, setIsResending] = useState(false);

  const handleSendSuccess = useCallback((email) => {
    setConfirmation({ email, lastSentTime: Date.now() });
  }, []);

  const handleResend = useCallback(() => {
    if (!confirmation || isResending) {
      return;
    }

    setIsResending(true);
    fetch(URLS.userPasswordRestore(), {
      method: 'post',
      data: {
        email: confirmation.email,
      },
    })
      .then(() => {
        setConfirmation((prev) => ({ ...prev, lastSentTime: Date.now() }));
      })
      .catch((error) => dispatch(showDefaultErrorNotification(error)))
      .then(() => {
        setIsResending(false);
      });
  }, [confirmation, dispatch, isResending]);

  return (
    <>
      {confirmation ? (
        <PageSectionContainer
          header={messages.forgotPass}
          hint={messages.confirmationHint}
          customClassName={cx('confirmation-block')}
          compactHeaderSpacing
          leftAligned
        >
          <ForgotPasswordConfirmation
            email={confirmation.email}
            lastSentTime={confirmation.lastSentTime}
            isResending={isResending}
            onResend={handleResend}
          />
        </PageSectionContainer>
      ) : (
        <PageSectionContainer header={messages.forgotPass} hint={messages.enterEmail} leftAligned>
          <ForgotPasswordForm onSuccess={handleSendSuccess} />
        </PageSectionContainer>
      )}
      <OutsideLoginFooter />
    </>
  );
};
