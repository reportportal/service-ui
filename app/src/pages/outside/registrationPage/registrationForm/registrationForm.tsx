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

import { useEffect, type FormEventHandler } from 'react';
import { createClassnames } from 'common/utils/createClassnames';
import { injectIntl, defineMessages, IntlShape } from 'react-intl';
import { reduxForm, InjectedFormProps } from 'redux-form';
import { connect } from 'react-redux';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { InputOutside } from 'components/inputs/inputOutside';
import { BigButton } from 'components/buttons/bigButton';
import {
  PASSWORD_MAX_ALLOWED_LENGTH,
  REGISTRATION_NAME_MIN_LENGTH,
  REGISTRATION_NAME_MAX_LENGTH,
} from 'common/constants/validation';
import { commonValidators } from 'common/utils/validation';
import { passwordMinLengthSelector } from 'controllers/appInfo';
import { validationLocalization } from 'common/constants/localization/validationLocalization';
import NameIcon from './img/name-icon-inline.svg';
import EmailIcon from './img/email-icon-inline.svg';
import PasswordIcon from './img/password-icon-inline.svg';
import styles from './registrationForm.scss';

const cx = createClassnames(styles);

const ERROR_MESSAGE_KEYS = {
  REQUIRED_FIELD_WITH_PERIOD: 'requiredFieldWithPeriodHint',
  CONFIRM_PASSWORD_HINT_MESSAGE: 'confirmPasswordHint',
} as const;

const messages = defineMessages({
  name: {
    id: 'RegistrationForm.namePlaceholder',
    defaultMessage: 'Enter Full Name',
  },
  password: {
    id: 'RegistrationForm.passwordPlaceholder',
    defaultMessage: 'Create Password',
  },
  confirmPassword: {
    id: 'RegistrationForm.passwordConfirmPlaceholder',
    defaultMessage: 'Confirm Password',
  },
  nameHint: {
    id: 'RegistrationForm.nameHint',
    defaultMessage:
      'Full name may contain {minLength}-{maxLength} characters, using only Latin letters, numbers, spaces, dots, hyphens, underscores, and apostrophes.',
  },
  register: {
    id: 'RegistrationForm.register',
    defaultMessage: 'Register',
  },
});

export interface RegistrationFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface InitialData {
  fullName?: string;
  password?: string;
  [key: string]: string | undefined;
}

interface OwnProps {
  submitForm?: (values: RegistrationFormValues) => Promise<unknown>;
  email?: string;
  loading?: boolean;
  initialData?: InitialData;
  submitButtonTitle?: string;
}

interface ConnectedProps {
  minLength: number;
  intl: IntlShape;
}

type Props = InjectedFormProps<RegistrationFormValues, OwnProps & ConnectedProps> &
  OwnProps &
  ConnectedProps;

const RegistrationFormComponent = ({
  handleSubmit,
  initialize,
  intl,
  invalid,
  loading = false,
  submitButtonTitle = '',
  submitForm = () => Promise.resolve(),
  email = '',
  initialData = {},
  minLength,
}: Props) => {
  const { formatMessage } = intl;

  useEffect(() => {
    initialize({
      ...initialData,
      name: initialData.fullName,
      confirmPassword: initialData.password,
      email,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitHandler = (values: RegistrationFormValues) => submitForm(values);

  return (
    <form
      className={cx('registration-form')}
      onSubmit={handleSubmit(submitHandler) as FormEventHandler<HTMLFormElement>}
    >
      <div className={cx('name-field')}>
        <FieldProvider name="name">
          <FieldErrorHint
            provideHint={false}
            errorsWithHint={[ERROR_MESSAGE_KEYS.REQUIRED_FIELD_WITH_PERIOD]}
          >
            <InputOutside
              icon={NameIcon}
              maxLength={Number(REGISTRATION_NAME_MAX_LENGTH)}
              placeholder={formatMessage(messages.name)}
              hasDynamicValidation
              hint={formatMessage(messages.nameHint, {
                minLength: Number(REGISTRATION_NAME_MIN_LENGTH),
                maxLength: Number(REGISTRATION_NAME_MAX_LENGTH),
              })}
              provideErrorHint
            />
          </FieldErrorHint>
        </FieldProvider>
      </div>
      <div className={cx('email-field')}>
        <FieldProvider name="email">
          <InputOutside icon={EmailIcon} disabled />
        </FieldProvider>
      </div>
      <div className={cx('password-field')}>
        <FieldProvider name="password">
          <FieldErrorHint provideHint={false} errorsWithHint={[ERROR_MESSAGE_KEYS.REQUIRED_FIELD_WITH_PERIOD]}>
            <InputOutside
              type={'password'}
              icon={PasswordIcon}
              maxLength={PASSWORD_MAX_ALLOWED_LENGTH}
              placeholder={formatMessage(messages.password)}
              hasDynamicValidation
              hint={formatMessage(validationLocalization.passwordHint, { minLength })}
              provideErrorHint
            />
          </FieldErrorHint>
        </FieldProvider>
      </div>
      <div className={cx('confirm-password-field')}>
        <FieldProvider name="confirmPassword">
          <FieldErrorHint
            formPath={'user.registrationForm'}
            fieldName={'confirmPassword'}
            provideHint={false}
          >
            <InputOutside
              type={'password'}
              icon={PasswordIcon}
              maxLength={PASSWORD_MAX_ALLOWED_LENGTH}
              placeholder={formatMessage(messages.confirmPassword)}
              hasDynamicValidation
              provideErrorHint
            />
          </FieldErrorHint>
        </FieldProvider>
      </div>

      <div className={cx('buttons-container')}>
        <div className={cx('button-register')}>
          <BigButton type={'submit'} roundedCorners color={'booger'} disabled={loading || invalid}>
            {submitButtonTitle || formatMessage(messages.register)}
          </BigButton>
        </div>
      </div>
    </form>
  );
};

export const RegistrationForm = connect((state) => ({
  minLength: passwordMinLengthSelector(state),
}))(
  injectIntl(
    reduxForm<RegistrationFormValues, OwnProps & ConnectedProps>({
      form: 'registration',
      validate: ({ name, password, confirmPassword }, { minLength, intl }) => {
        const passwordMessage = intl.formatMessage(validationLocalization.passwordHint, {
          minLength,
        });
        const passwordValidator = commonValidators.createPasswordValidator(
          minLength,
          passwordMessage,
        );

        const passwordErrorMessage = password?.trim()
          ? passwordValidator(password)
          : ERROR_MESSAGE_KEYS.REQUIRED_FIELD_WITH_PERIOD;

        let confirmPasswordErrorMessage: string | undefined;
        if (!confirmPassword?.trim()) {
          confirmPasswordErrorMessage = ERROR_MESSAGE_KEYS.REQUIRED_FIELD_WITH_PERIOD;
        } else if (confirmPassword !== password) {
          confirmPasswordErrorMessage = ERROR_MESSAGE_KEYS.CONFIRM_PASSWORD_HINT_MESSAGE;
        }

        const nameErrorMessage = name?.trim()
          ? commonValidators.userName(name)
          : ERROR_MESSAGE_KEYS.REQUIRED_FIELD_WITH_PERIOD;

        return {
          password: passwordErrorMessage,
          confirmPassword: confirmPasswordErrorMessage,
          name: nameErrorMessage,
        };
      },
    })(RegistrationFormComponent),
  ),
);
