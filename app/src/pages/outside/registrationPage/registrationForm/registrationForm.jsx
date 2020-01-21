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

import { Component } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl';
import { reduxForm, SubmissionError } from 'redux-form';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldBottomConstraints } from 'components/fields/fieldBottomConstraints';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { InputOutside } from 'components/inputs/inputOutside';
import { BigButton } from 'components/buttons/bigButton';
import { commonValidators } from 'common/utils/validation';
import LoginIcon from './img/login-icon-inline.svg';
import NameIcon from './img/name-icon-inline.svg';
import EmailIcon from './img/email-icon-inline.svg';
import PasswordIcon from './img/password-icon-inline.svg';
import styles from './registrationForm.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  login: {
    id: 'RegistrationForm.loginPlaceholder',
    defaultMessage: 'Login',
  },
  name: {
    id: 'RegistrationForm.namePlaceholder',
    defaultMessage: 'Full name',
  },
  password: {
    id: 'RegistrationForm.passwordPlaceholder',
    defaultMessage: 'Password',
  },
  confirmPassword: {
    id: 'RegistrationForm.passwordConfirmPlaceholder',
    defaultMessage: 'Confirm password',
  },
  loginConstraint: {
    id: 'RegistrationForm.loginConstraints',
    defaultMessage: '1-128 symbols, latin, numeric characters, symbols: hyphen, underscore, dot',
  },
  nameConstraint: {
    id: 'RegistrationForm.nameConstraints',
    defaultMessage:
      '3-256 symbols, latin, cyrillic, numeric characters, symbols: hyphen, underscore, dot, space',
  },
  passwordConstraint: {
    id: 'RegistrationForm.passwordConstraints',
    defaultMessage: '4-256 symbols',
  },
});

@reduxForm({
  form: 'registration',
  validate: ({ login, name, password, confirmPassword }) => ({
    password: commonValidators.password(password),
    confirmPassword: (!confirmPassword || confirmPassword !== password) && 'confirmPasswordHint',
    login: commonValidators.login(login),
    name: commonValidators.userName(name),
  }),
})
@injectIntl
export class RegistrationForm extends Component {
  static propTypes = {
    submitForm: PropTypes.func,
    reset: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    autofill: PropTypes.func.isRequired,
    email: PropTypes.string,
  };

  static defaultProps = {
    submitForm: () => {},
    email: '',
  };

  componentDidMount = () => {
    this.autofillEmail();
  };

  autofillEmail = () => this.props.autofill('email', this.props.email);

  resetForm = () => {
    this.props.reset();
    this.autofillEmail();
  };

  submitHandler = (...args) =>
    this.props.submitForm(...args).catch((message) => {
      throw new SubmissionError({ login: message });
    });

  render() {
    const { handleSubmit, intl } = this.props;
    const { formatMessage } = intl;

    return (
      <form className={cx('registration-form')} onSubmit={handleSubmit(this.submitHandler)}>
        <div className={cx('login-field')}>
          <FieldProvider name="login">
            <FieldBottomConstraints text={formatMessage(messages.loginConstraint)}>
              <FieldErrorHint>
                <InputOutside
                  icon={LoginIcon}
                  maxLength={'128'}
                  placeholder={formatMessage(messages.login)}
                />
              </FieldErrorHint>
            </FieldBottomConstraints>
          </FieldProvider>
        </div>
        <div className={cx('name-field')}>
          <FieldProvider name="name">
            <FieldBottomConstraints text={formatMessage(messages.nameConstraint)}>
              <FieldErrorHint>
                <InputOutside
                  icon={NameIcon}
                  maxLength="256"
                  placeholder={formatMessage(messages.name)}
                />
              </FieldErrorHint>
            </FieldBottomConstraints>
          </FieldProvider>
        </div>
        <div className={cx('email-field')}>
          <FieldProvider name="email">
            <InputOutside icon={EmailIcon} disabled />
          </FieldProvider>
        </div>
        <div className={cx('password-field')}>
          <FieldProvider name="password">
            <FieldBottomConstraints text={formatMessage(messages.passwordConstraint)}>
              <FieldErrorHint>
                <InputOutside
                  type={'password'}
                  icon={PasswordIcon}
                  maxLength="256"
                  placeholder={formatMessage(messages.password)}
                />
              </FieldErrorHint>
            </FieldBottomConstraints>
          </FieldProvider>
        </div>
        <div className={cx('confirm-password-field')}>
          <FieldProvider name="confirmPassword">
            <FieldErrorHint formPath={'user.registrationForm'} fieldName={'confirmPassword'}>
              <InputOutside
                type={'password'}
                icon={PasswordIcon}
                maxLength="256"
                placeholder={formatMessage(messages.confirmPassword)}
              />
            </FieldErrorHint>
          </FieldProvider>
        </div>

        <div className={cx('buttons-container')}>
          <div className={cx('button-reset')}>
            <BigButton color={'gray-60'} roundedCorners onClick={this.resetForm}>
              <FormattedMessage id={'RegistrationForm.reset'} defaultMessage={'Reset'} />
            </BigButton>
          </div>
          <div className={cx('button-register')}>
            <BigButton type={'submit'} roundedCorners color={'organish'}>
              <FormattedMessage id={'RegistrationForm.register'} defaultMessage={'Register'} />
            </BigButton>
          </div>
        </div>
      </form>
    );
  }
}
