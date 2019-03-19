/*
 * Copyright 2017 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/reportportal/service-ui
 *
 * Report Portal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Report Portal is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Report Portal.  If not, see <http://www.gnu.org/licenses/>.
 */

import { Component } from 'react';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape, defineMessages } from 'react-intl';
import { reduxForm, SubmissionError } from 'redux-form';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldBottomConstraints } from 'components/fields/fieldBottomConstraints';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { InputOutside } from 'components/inputs/inputOutside';
import { BigButton } from 'components/buttons/bigButton';
import { validate } from 'common/utils';
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
    defaultMessage: '4-128 symbols',
  },
});

@reduxForm({
  form: 'registration',
  validate: ({ login, name, password, confirmPassword }) => ({
    password: (!password || !validate.password(password)) && 'passwordHint',
    confirmPassword: (!confirmPassword || confirmPassword !== password) && 'confirmPasswordHint',
    login: (!login || !validate.login(login)) && 'loginHint',
    name: (!name || !validate.name(name)) && 'nameHint',
  }),
})
@injectIntl
export class RegistrationForm extends Component {
  static propTypes = {
    submitForm: PropTypes.func,
    reset: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
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
                  maxLength="128"
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
                maxLength="128"
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
