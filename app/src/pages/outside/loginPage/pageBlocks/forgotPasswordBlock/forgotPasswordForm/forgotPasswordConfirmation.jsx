/*
 * Copyright 2026 EPAM Systems
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

import { useEffect, useReducer } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { Button} from "@reportportal/ui-kit";
import { LoadingSubmitButton } from 'components/loadingSubmitButton';
import { getRestoreResendLockoutState } from '../restorePasswordResendLockout';
import styles from './forgotPasswordConfirmation.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  resendCountdown: {
    id: 'ForgotPasswordForm.resendCountdown',
    defaultMessage:
      'If you didn\u2019t receive the confirmation email, you can resend it in {seconds, number} seconds:',
  },
  resendAvailable: {
    id: 'ForgotPasswordForm.resendAvailable',
    defaultMessage: 'If you didn\u2019t receive the confirmation email, you can resend it:',
  },
});

export const ForgotPasswordConfirmation = ({ email, lastSentTime, isResending, onResend }) => {
  const { formatMessage } = useIntl();
  const [, forceCountdownTick] = useReducer((tick) => tick + 1, 0);
  const { remainingSec, isResendLocked } = getRestoreResendLockoutState(lastSentTime);

  useEffect(() => {
    if (!isResendLocked) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      forceCountdownTick();
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isResendLocked, lastSentTime]);

  const handleResendClick = () => {
    if (isResendLocked || isResending) {
      return;
    }

    onResend();
  };

  return (
    <div className={cx('forgot-password-confirmation')}>
      <p className={cx('email-value')}>{email}</p>
      <p className={cx('resend-message')}>
        {isResendLocked
          ? formatMessage(messages.resendCountdown, { seconds: remainingSec })
          : formatMessage(messages.resendAvailable)}
      </p>
      <div className={cx('resend-button-container')}>
        <Button
          variant={"ghost"}
          disabled={isResendLocked || isResending}
          onClick={handleResendClick}
        >
          <LoadingSubmitButton isLoading={isResending}>
            <FormattedMessage id="ForgotPasswordForm.resend" defaultMessage="Resend" />
          </LoadingSubmitButton>
        </Button>
      </div>
    </div>
  );
};

ForgotPasswordConfirmation.propTypes = {
  email: PropTypes.string.isRequired,
  lastSentTime: PropTypes.number.isRequired,
  isResending: PropTypes.bool.isRequired,
  onResend: PropTypes.func.isRequired,
};
