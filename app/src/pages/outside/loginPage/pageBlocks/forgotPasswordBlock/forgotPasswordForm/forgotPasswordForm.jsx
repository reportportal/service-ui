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
import { Button, FieldText } from '@reportportal/ui-kit';
import { useDispatch, useSelector } from 'react-redux';
import { reduxForm, formValueSelector } from 'redux-form';
import { redirect } from 'redux-first-router';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import {
  showNotification,
  showDefaultErrorNotification,
  NOTIFICATION_TYPES,
} from 'controllers/notification';
import Link from 'redux-first-router-link';
import PropTypes from 'prop-types';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { LoadingSubmitButton } from 'components/loadingSubmitButton';
import { fetch } from 'common/utils/fetch';
import { commonValidators } from 'common/utils/validation';
import { URLS } from 'common/urls';
import { LOGIN_PAGE } from 'controllers/pages';
import styles from './forgotPasswordForm.scss';

const cx = classNames.bind(styles);
const emailValueSelector = formValueSelector('forgotPassword');

const placeholders = defineMessages({
  email: {
    id: 'ForgotPasswordForm.emailPlaceholder',
    defaultMessage: 'Email',
  },
});

const notifications = defineMessages({
  successSendEmail: {
    id: 'ForgotPasswordForm.successSendEmail',
    defaultMessage: 'Password recovery instructions have been sent to email {email}',
  },
});

const ForgotPasswordFormComponent = ({ handleSubmit }) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const emailValue = useSelector((state) => emailValueSelector(state, 'email') ?? '');
  const [isLoading, setIsLoading] = useState(false);

  const isEmailValid = !commonValidators.email(emailValue);

  const submitForm = useCallback(
    ({ email }) => {
      if (isLoading) {
        return;
      }

      setIsLoading(true);
      fetch(URLS.userPasswordRestore(), {
        method: 'post',
        data: {
          email,
        },
      })
        .then(() => {
          dispatch(
            showNotification({
              type: NOTIFICATION_TYPES.SUCCESS,
              message: formatMessage(notifications.successSendEmail, { email }),
            }),
          );
          dispatch(redirect({ type: LOGIN_PAGE }));
        })
        .catch((error) => dispatch(showDefaultErrorNotification(error)))
        .then(() => {
          setIsLoading(false);
        });
    },
    [dispatch, formatMessage, isLoading],
  );

  return (
    <form className={cx('forgot-password-form')} onSubmit={handleSubmit(submitForm)}>
      <div className={cx('email-field')}>
        <FieldProvider name="email">
          <FieldErrorHint provideHint={false} suppressError={isLoading}>
            <FieldText
              label={formatMessage(placeholders.email)}
              maxLength={128}
              defaultWidth={false}
              autoComplete="off"
              disabled={isLoading}
              displayError={!isLoading}
            />
          </FieldErrorHint>
        </FieldProvider>
      </div>
      <div className={cx('forgot-password-buttons-container')}>
        <div className={cx('forgot-password-button')}>
          <Link to={{ type: LOGIN_PAGE }} className={cx('button-link')}>
            <Button variant="ghost" className={cx('action-button')}>
              <FormattedMessage id={'ForgotPasswordForm.cancel'} defaultMessage={'Cancel'} />
            </Button>
          </Link>
        </div>
        <div className={cx('forgot-password-button')}>
          <Button
            type="submit"
            variant="primary"
            className={cx('action-button')}
            disabled={!isEmailValid || isLoading}
          >
            <LoadingSubmitButton isLoading={isLoading}>
              <FormattedMessage id={'ForgotPasswordForm.sendEmail'} defaultMessage={'Send'} />
            </LoadingSubmitButton>
          </Button>
        </div>
      </div>
    </form>
  );
};

ForgotPasswordFormComponent.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
};

export const ForgotPasswordForm = reduxForm({
  form: 'forgotPassword',
  validate: ({ email }) => ({
    email: commonValidators.email(email),
  }),
})(ForgotPasswordFormComponent);
