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

import { useCallback, useEffect, useMemo, useState, type FormEventHandler } from 'react';
import { createClassnames } from 'common/utils/createClassnames';
import { defineMessages, useIntl } from 'react-intl';
import { reduxForm, formValueSelector, InjectedFormProps } from 'redux-form';
import { useSelector } from 'react-redux';
import { FieldProvider } from 'components/fields/fieldProvider';
import { PasswordRequirementsList } from 'components/passwordRequirementsList';
import { Button, FieldText } from '@reportportal/ui-kit';
import { LoadingSubmitButton } from 'components/loadingSubmitButton';
import {
  PASSWORD_MAX_ALLOWED_LENGTH,
  REGISTRATION_NAME_MIN_LENGTH,
  REGISTRATION_NAME_MAX_LENGTH,
} from 'common/constants/validation';
import { commonValidators } from 'common/utils/validation';
import {
  areAllPasswordRulesMet,
  getPasswordRuleStatus,
} from 'common/utils/validation/passwordRules';
import { passwordMinLengthSelector } from 'controllers/appInfo';
import { OutsidePasswordField } from 'pages/outside/common/outsidePasswordField';
import styles from './registrationForm.scss';

const cx = createClassnames(styles);

const formSelector = formValueSelector('registration');

const messages = defineMessages({
  fullNameLabel: {
    id: 'RegistrationForm.fullNameLabel',
    defaultMessage: 'Full Name',
  },
  emailLabel: {
    id: 'RegistrationForm.emailLabel',
    defaultMessage: 'Email',
  },
  passwordLabel: {
    id: 'RegistrationForm.passwordLabel',
    defaultMessage: 'Password',
  },
  confirmPasswordLabel: {
    id: 'RegistrationForm.confirmPasswordLabel',
    defaultMessage: 'Confirm Password',
  },
  ruleMinLength: {
    id: 'RegistrationForm.ruleMinLength',
    defaultMessage: 'At least {minLength} characters',
  },
  ruleDigit: {
    id: 'RegistrationForm.ruleDigit',
    defaultMessage: 'Digits included',
  },
  ruleSpecialSymbol: {
    id: 'RegistrationForm.ruleSpecialSymbol',
    defaultMessage: 'A special symbol',
  },
  ruleUppercase: {
    id: 'RegistrationForm.ruleUppercase',
    defaultMessage: 'Upper-case (A - Z)',
  },
  ruleLowercase: {
    id: 'RegistrationForm.ruleLowercase',
    defaultMessage: 'Lower-case',
  },
  passwordPolicySummary: {
    id: 'RegistrationForm.passwordPolicySummary',
    defaultMessage:
      'Minimum {minLength} characters, including uppercase, lowercase, digit, special symbol. No spaces.',
  },
  passwordRequirementsError: {
    id: 'RegistrationForm.passwordRequirementsError',
    defaultMessage: "Password doesn't meet some of the following requirements:",
  },
  passwordsDoNotMatch: {
    id: 'RegistrationForm.passwordsDoNotMatch',
    defaultMessage: 'Passwords do not match',
  },
  nameHint: {
    id: 'RegistrationForm.nameHint',
    defaultMessage:
      'Full name may contain {minLength}-{maxLength} characters, using only Latin letters, numbers, spaces, dots, hyphens, underscores, and apostrophes.',
  },
  requiredField: {
    id: 'Common.requiredFieldHint',
    defaultMessage: 'Field is required',
  },
  capsLockOn: {
    id: 'ChangePasswordForm.capsLockOn',
    defaultMessage: 'Caps Lock is on',
  },
  register: {
    id: 'RegistrationForm.register',
    defaultMessage: 'Create',
  },
});

export interface RegistrationFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface OwnProps {
  submitForm?: (values: RegistrationFormValues) => Promise<unknown>;
  email?: string;
  loading?: boolean;
  initialData?: Record<string, string | undefined>;
  submitButtonTitle?: string;
}

type Props = InjectedFormProps<RegistrationFormValues, OwnProps> & OwnProps;

const RegistrationFormComponent = ({
  handleSubmit,
  initialize,
  loading = false,
  submitButtonTitle = '',
  submitForm = () => Promise.resolve(),
  email = '',
  initialData = {},
}: Props) => {
  const { formatMessage } = useIntl();
  const minLength = useSelector(passwordMinLengthSelector);

  const password = useSelector((state) => (formSelector(state, 'password') as string) ?? '');
  const confirmPassword = useSelector(
    (state) => (formSelector(state, 'confirmPassword') as string) ?? '',
  );
  const name = useSelector((state) => (formSelector(state, 'name') as string) ?? '');

  // Password errors are shown only after blur or submit — not while typing.
  const [showPasswordValidation, setShowPasswordValidation] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  useEffect(() => {
    initialize({
      ...initialData,
      name: initialData.fullName,
      confirmPassword: initialData.password,
      email,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ruleStatus = useMemo(
    () => getPasswordRuleStatus(password, minLength),
    [password, minLength],
  );
  const allRulesMet = areAllPasswordRulesMet(ruleStatus);
  const hasSpace = password.length > 0 && /\s/.test(password);
  const passwordFullyValid = allRulesMet && !hasSpace;

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

  // Fail styling on checklist items only when rules themselves are unmet (not when space is the only issue)
  const showPasswordFailState =
    showPasswordValidation && !allRulesMet && password.length > 0;

  const passwordError = useMemo(() => {
    if (!showPasswordValidation) return undefined;
    if (!password) return formatMessage(messages.requiredField);
    if (allRulesMet && hasSpace) {
      return formatMessage(messages.passwordPolicySummary, { minLength });
    }
    if (!allRulesMet) {
      return formatMessage(messages.passwordRequirementsError);
    }
    return undefined;
  }, [showPasswordValidation, password, allRulesMet, hasSpace, minLength, formatMessage]);

  const hasMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const confirmPasswordError = useMemo(() => {
    if (!submitAttempted) return undefined;
    if (!confirmPassword.trim()) return formatMessage(messages.requiredField);
    if (hasMismatch) return formatMessage(messages.passwordsDoNotMatch);
    return undefined;
  }, [submitAttempted, confirmPassword, hasMismatch, formatMessage]);

  const nameError = useMemo(() => {
    if (!submitAttempted) return undefined;
    if (!name.trim()) return formatMessage(messages.requiredField);
    if (commonValidators.userName(name)) {
      return formatMessage(messages.nameHint, {
        minLength: Number(REGISTRATION_NAME_MIN_LENGTH),
        maxLength: Number(REGISTRATION_NAME_MAX_LENGTH),
      });
    }
    return undefined;
  }, [submitAttempted, name, formatMessage]);

  const hasActiveErrors = !!(passwordError || confirmPasswordError || nameError);
  const isCreateDisabled = loading || hasActiveErrors;
  const isConfirmDisabled = !passwordFullyValid || loading;

  const capsLockMessage = formatMessage(messages.capsLockOn);

  const handlePasswordChange = useCallback(() => {
    setShowPasswordValidation(false);
  }, []);

  const handlePasswordBlur = useCallback(() => {
    if (password.length > 0) {
      setShowPasswordValidation(true);
    }
  }, [password]);

  const submitHandler = useCallback(
    (values: RegistrationFormValues) => {
      setSubmitAttempted(true);
      setShowPasswordValidation(true);

      const nameValid = name.trim() && !commonValidators.userName(name);
      const confirmValid = confirmPassword === password && confirmPassword.trim();

      if (!nameValid || !passwordFullyValid || !confirmValid) {
        return;
      }

      return submitForm(values);
    },
    [name, password, confirmPassword, passwordFullyValid, submitForm],
  );

  return (
    <form
      className={cx('registration-form')}
      onSubmit={handleSubmit(submitHandler) as FormEventHandler<HTMLFormElement>}
    >
      <div className={cx('name-field')}>
        <FieldProvider name="name" error={nameError} touched={!!nameError}>
          <FieldText
            label={formatMessage(messages.fullNameLabel)}
            maxLength={Number(REGISTRATION_NAME_MAX_LENGTH)}
            defaultWidth={false}
            displayError={!!nameError}
            disabled={loading}
          />
        </FieldProvider>
      </div>

      <div className={cx('email-field')}>
        <FieldProvider name="email">
          <FieldText
            label={formatMessage(messages.emailLabel)}
            defaultWidth={false}
            disabled
          />
        </FieldProvider>
      </div>

      <div className={cx('password-field')} onBlur={handlePasswordBlur}>
        <FieldProvider name="password" error={passwordError} touched={!!passwordError}>
          <OutsidePasswordField
            label={formatMessage(messages.passwordLabel)}
            maxLength={PASSWORD_MAX_ALLOWED_LENGTH}
            defaultWidth={false}
            autoComplete="off"
            disabled={loading}
            displayError={!!passwordError}
            capsLockMessage={capsLockMessage}
            onChange={handlePasswordChange}
          />
        </FieldProvider>
        <PasswordRequirementsList
          ruleStatus={ruleStatus}
          ruleLabels={ruleLabels}
          showFailState={showPasswordFailState}
        />
      </div>

      <div
        className={cx('confirm-password-field', {
          'confirm-password-field--inactive': isConfirmDisabled,
        })}
      >
        <FieldProvider
          name="confirmPassword"
          error={confirmPasswordError}
          touched={!!confirmPasswordError}
        >
          <OutsidePasswordField
            label={formatMessage(messages.confirmPasswordLabel)}
            maxLength={PASSWORD_MAX_ALLOWED_LENGTH}
            defaultWidth={false}
            autoComplete="off"
            disabled={isConfirmDisabled}
            displayError={!!confirmPasswordError}
            capsLockMessage={capsLockMessage}
          />
        </FieldProvider>
      </div>

      <div className={cx('register-button')}>
        <Button
          type="submit"
          variant="primary"
          className={cx('action-button')}
          disabled={isCreateDisabled}
        >
          <LoadingSubmitButton isLoading={loading}>
            {submitButtonTitle || formatMessage(messages.register)}
          </LoadingSubmitButton>
        </Button>
      </div>
    </form>
  );
};

export const RegistrationForm = reduxForm<RegistrationFormValues, OwnProps>({
  form: 'registration',
})(RegistrationFormComponent);
