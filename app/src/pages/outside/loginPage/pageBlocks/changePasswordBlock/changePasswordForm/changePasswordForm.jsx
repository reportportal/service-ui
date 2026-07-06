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

import { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { useDispatch, useSelector } from 'react-redux';
import { reduxForm, formValueSelector } from 'redux-form';
import { redirect } from 'redux-first-router';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { Button } from '@reportportal/ui-kit';
import { fetch, connectRouter } from 'common/utils';
import { PASSWORD_MAX_ALLOWED_LENGTH } from 'common/constants/validation';
import {
  areAllPasswordRulesMet,
  getPasswordRuleStatus,
} from 'common/utils/validation/passwordRules';
import { passwordMinLengthSelector } from 'controllers/appInfo';
import { URLS } from 'common/urls';
import { LOGIN_PAGE } from 'controllers/pages';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { PasswordRequirementsList } from 'components/passwordRequirementsList';
import { LoadingSubmitButton } from 'components/loadingSubmitButton';
import { FieldProvider } from 'components/fields/fieldProvider';
import { OutsidePasswordField } from 'pages/outside/common/outsidePasswordField';
import styles from './changePasswordForm.scss';

const cx = classNames.bind(styles);
const formValueSelectorInstance = formValueSelector('changePassword');

const messages = defineMessages({
  newPasswordLabel: {
    id: 'ChangePasswordForm.newPasswordLabel',
    defaultMessage: 'New Password',
  },
  newPasswordConfirmLabel: {
    id: 'ChangePasswordForm.newPasswordConfirmLabel',
    defaultMessage: 'Confirm New Password',
  },
  ruleMinLength: {
    id: 'ChangePasswordForm.ruleMinLength',
    defaultMessage: 'At least {minLength} characters',
  },
  ruleDigit: {
    id: 'ChangePasswordForm.ruleDigit',
    defaultMessage: 'Digits included',
  },
  ruleSpecialSymbol: {
    id: 'ChangePasswordForm.ruleSpecialSymbol',
    defaultMessage: 'A special symbol',
  },
  ruleUppercase: {
    id: 'ChangePasswordForm.ruleUppercase',
    defaultMessage: 'Upper-case (A - Z)',
  },
  ruleLowercase: {
    id: 'ChangePasswordForm.ruleLowercase',
    defaultMessage: 'Lower-case',
  },
  passwordRequirementsError: {
    id: 'ChangePasswordForm.passwordRequirementsError',
    defaultMessage: "Password doesn't meet some of the following requirements:",
  },
  passwordsDoNotMatch: {
    id: 'ChangePasswordForm.passwordsDoNotMatch',
    defaultMessage: 'Passwords do not match',
  },
  capsLockOn: {
    id: 'ChangePasswordForm.capsLockOn',
    defaultMessage: 'Caps Lock is on',
  },
  save: {
    id: 'ChangePasswordForm.save',
    defaultMessage: 'Save',
  },
  successChange: {
    id: 'ChangePasswordForm.successChange',
    defaultMessage: 'Your password has been changed successfully',
  },
  failedChange: {
    id: 'ChangePasswordForm.failedChange',
    defaultMessage: 'Failed to update password',
  },
});

const ChangePasswordFormComponent = ({ handleSubmit, resetQueryParam = '' }) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const minLength = useSelector(passwordMinLengthSelector);
  const password = useSelector((state) => formValueSelectorInstance(state, 'password') ?? '');
  const passwordRepeat = useSelector(
    (state) => formValueSelectorInstance(state, 'passwordRepeat') ?? '',
  );

  const [isLoading, setIsLoading] = useState(false);

  const ruleStatus = useMemo(
    () => getPasswordRuleStatus(password, minLength),
    [password, minLength],
  );
  const allRulesMet = areAllPasswordRulesMet(ruleStatus);
  const passwordsMatch = passwordRepeat.length > 0 && password === passwordRepeat;
  const hasMismatch = passwordRepeat.length > 0 && password !== passwordRepeat;
  const showPasswordRequirementsError = password.length > 0 && !allRulesMet;

  const ruleLabels = useMemo(
    () => ({
      minLength: formatMessage(messages.ruleMinLength, { minLength }),
      digit: formatMessage(messages.ruleDigit),
      specialSymbol: formatMessage(messages.ruleSpecialSymbol),
      uppercase: formatMessage(messages.ruleUppercase),
      lowercase: formatMessage(messages.ruleLowercase),
    }),
    [formatMessage, minLength],
  );

  const passwordError = useMemo(() => {
    if (showPasswordRequirementsError) {
      return formatMessage(messages.passwordRequirementsError);
    }

    return undefined;
  }, [formatMessage, showPasswordRequirementsError]);

  const confirmPasswordError = useMemo(() => {
    if (hasMismatch) {
      return formatMessage(messages.passwordsDoNotMatch);
    }

    return undefined;
  }, [formatMessage, hasMismatch]);

  const isSaveDisabled = !allRulesMet || !passwordsMatch || isLoading;
  const isConfirmDisabled = !allRulesMet || isLoading;
  const capsLockMessage = formatMessage(messages.capsLockOn);

  const changePassword = useCallback(
    ({ password: newPassword }) => {
      if (isLoading) {
        return;
      }

      if (!allRulesMet || !passwordsMatch) {
        return;
      }

      setIsLoading(true);
      fetch(URLS.userPasswordReset(), {
        method: 'post',
        data: {
          password: newPassword,
          uuid: resetQueryParam,
        },
      })
        .then(() => {
          dispatch(
            showNotification({
              type: NOTIFICATION_TYPES.SUCCESS,
              message: formatMessage(messages.successChange),
            }),
          );
          dispatch(redirect({ type: LOGIN_PAGE }));
        })
        .catch(() => {
          dispatch(
            showNotification({
              type: NOTIFICATION_TYPES.ERROR,
              message: formatMessage(messages.failedChange),
            }),
          );
        })
        .then(() => {
          setIsLoading(false);
        });
    },
    [
      allRulesMet,
      dispatch,
      formatMessage,
      isLoading,
      passwordsMatch,
      resetQueryParam,
    ],
  );

  return (
    <form className={cx('change-password-form')} onSubmit={handleSubmit(changePassword)}>
      <div className={cx('new-password-field')}>
        <FieldProvider
          name="password"
          error={passwordError}
          touched={!!passwordError}
        >
          <OutsidePasswordField
            label={formatMessage(messages.newPasswordLabel)}
            capsLockMessage={capsLockMessage}
            maxLength={PASSWORD_MAX_ALLOWED_LENGTH}
            defaultWidth={false}
            autoComplete="off"
            disabled={isLoading}
            displayError={!!passwordError}
          />
        </FieldProvider>
        <PasswordRequirementsList
          ruleStatus={ruleStatus}
          ruleLabels={ruleLabels}
          showFailState={showPasswordRequirementsError}
        />
      </div>
      <div
        className={cx('confirm-new-password-field', {
          'confirm-new-password-field--inactive': isConfirmDisabled,
        })}
      >
        <FieldProvider
          name="passwordRepeat"
          error={confirmPasswordError}
          touched={!!confirmPasswordError}
        >
          <OutsidePasswordField
            label={formatMessage(messages.newPasswordConfirmLabel)}
            capsLockMessage={capsLockMessage}
            maxLength={PASSWORD_MAX_ALLOWED_LENGTH}
            defaultWidth={false}
            autoComplete="off"
            disabled={isConfirmDisabled}
            displayError={!!confirmPasswordError}
          />
        </FieldProvider>
      </div>
      <div className={cx('change-password-button')}>
        <Button
          type="submit"
          variant="primary"
          className={cx('action-button')}
          disabled={isSaveDisabled}
        >
          <LoadingSubmitButton isLoading={isLoading}>
            <FormattedMessage id={'ChangePasswordForm.save'} defaultMessage={'Save'} />
          </LoadingSubmitButton>
        </Button>
      </div>
    </form>
  );
};

ChangePasswordFormComponent.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  resetQueryParam: PropTypes.string,
};

const ConnectedChangePasswordForm = connectRouter(({ reset: resetQueryParam }) => ({
  resetQueryParam,
}))(ChangePasswordFormComponent);

export const ChangePasswordForm = reduxForm({
  form: 'changePassword',
})(ConnectedChangePasswordForm);
