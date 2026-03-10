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
import { FormattedMessage, injectIntl, defineMessages, IntlShape } from 'react-intl';
import { reduxForm, InjectedFormProps, SubmissionError } from 'redux-form';
import { connect } from 'react-redux';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { InputOutside } from 'components/inputs/inputOutside';
import { BigButton } from 'components/buttons/bigButton';
import { commonValidators } from 'common/utils/validation';
import { passwordMinLengthSelector } from 'controllers/appInfo';
import { validationLocalization } from 'common/constants/localization/validationLocalization';
import NameIcon from './img/name-icon-inline.svg';
import EmailIcon from './img/email-icon-inline.svg';
import PasswordIcon from './img/password-icon-inline.svg';
import styles from './registrationForm.scss';

const cx = createClassnames(styles);

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
  fullNameHint: {
    id: 'RegistrationForm.fullNameHint',
    defaultMessage:
      'Names must be 3-60 characters, using only Latin or Cyrillic letters, numbers, spaces, dots, hyphens, underscores, and apostrophes.',
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

  const submitHandler = (values: RegistrationFormValues) =>
    submitForm(values).catch((message: string) => {
      throw new SubmissionError({ email: message });
    });

  return (
    <form
      className={cx('registration-form')}
      onSubmit={handleSubmit(submitHandler) as FormEventHandler<HTMLFormElement>}
    >
      <div className={cx('name-field')}>
        <FieldProvider name="name">
          <FieldErrorHint provideHint={false} errorsWithHint={['requiredFieldWithPeriodHint']}>
            <InputOutside
              icon={NameIcon}
              maxLength="256"
              placeholder={formatMessage(messages.name)}
              hasDynamicValidation
              hint={formatMessage(messages.fullNameHint)}
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
          <FieldErrorHint provideHint={false}>
            <InputOutside
              type={'password'}
              icon={PasswordIcon}
              maxLength="256"
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
              maxLength="256"
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
            {submitButtonTitle || (
              <FormattedMessage id={'RegistrationForm.register'} defaultMessage={'Register'} />
            )}
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

        return {
          password: passwordValidator(password),
          confirmPassword:
            (!confirmPassword || confirmPassword !== password) && 'confirmPasswordHint',
          name: !name?.trim() ? 'requiredFieldWithPeriodHint' : commonValidators.userName(name),
        };
      },
    })(RegistrationFormComponent),
  ),
);
