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

import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { signal } from 'cerebral/tags';
import { form } from '@cerebral/forms';
import { FormattedMessage, injectIntl, intlShape, defineMessages } from 'react-intl';
import FieldBottomConstraints from 'components/fields/fieldBottomConstraints/fieldBottomConstraints';
import FieldErrorHint from 'components/fields/fieldErrorHint/fieldErrorHint';
import FieldWithIcon from 'components/fields/fieldWithIcon/fieldWithIcon';
import Input from 'components/inputs/input/input';
import InputPassword from 'components/inputs/inputPassword/inputPassword';
import BigButton from 'components/buttons/bigButton/bigButton';
import LoginIcon from './img/login-icon.svg';
import NameIcon from './img/name-icon.svg';
import EmailIcon from './img/email-icon.svg';
import PasswordIcon from './img/password-icon.svg';

import styles from './registrationForm.scss';

const cx = classNames.bind(styles);

const RegistrationForm = ({ submitForm, resetForm, intl }) => {
  const submitHandler = (e) => {
    e.preventDefault();
    submitForm();
  };
  const resetHandler = (e) => {
    e.preventDefault();
    resetForm();
  };
  const { formatMessage } = intl;
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
  });

  return (
    <form className={cx('registration-form')} onSubmit={submitHandler}>
      <div className={cx('login-field')}>
        <FieldBottomConstraints formPath={'user.registrationForm'} fieldName={'login'} text={<FormattedMessage id={'RegistrationForm.loginConstraints'} defaultMessage={'1-128 symbols, latin, numeric characters, symbols: hyphen, underscore, dot'} />}>
          <FieldErrorHint>
            <FieldWithIcon icon={LoginIcon}>
              <Input maxLength={'128'} placeholder={formatMessage(messages.login)} />
            </FieldWithIcon>
          </FieldErrorHint>
        </FieldBottomConstraints>
      </div>
      <div className={cx('name-field')}>
        <FieldBottomConstraints formPath={'user.registrationForm'} fieldName={'name'} text={<FormattedMessage id={'RegistrationForm.nameConstraints'} defaultMessage={'3-256 symbols, latin, cyrillic, numeric characters, symbols: hyphen, underscore, dot, space'} />}>
          <FieldErrorHint>
            <FieldWithIcon icon={NameIcon}>
              <Input maxLength={'256'} placeholder={formatMessage(messages.name)} />
            </FieldWithIcon>
          </FieldErrorHint>
        </FieldBottomConstraints>
      </div>
      <div className={cx('email-field')}>
        <FieldWithIcon formPath={'user.registrationForm'} fieldName={'email'} icon={EmailIcon}>
          <Input />
        </FieldWithIcon>
      </div>
      <div className={cx('password-field')}>
        <FieldBottomConstraints formPath={'user.registrationForm'} fieldName={'password'} text={<FormattedMessage id={'RegistrationForm.passwordConstraints'} defaultMessage={'4-25 symbols'} />}>
          <FieldErrorHint>
            <FieldWithIcon icon={PasswordIcon}>
              <InputPassword maxLength={'25'} placeholder={formatMessage(messages.password)} />
            </FieldWithIcon>
          </FieldErrorHint>
        </FieldBottomConstraints>
      </div>
      <div className={cx('confirm-password-field')}>
        <FieldErrorHint formPath={'user.registrationForm'} fieldName={'confirmPassword'} >
          <FieldWithIcon icon={PasswordIcon}>
            <InputPassword maxLength={'25'} placeholder={formatMessage(messages.confirmPassword)} />
          </FieldWithIcon>
        </FieldErrorHint>
      </div>

      <div className={cx('buttons-container')}>
        <div className={cx('button-reset')}>
          <BigButton color={'gray-60'} onClick={resetHandler} >
            <FormattedMessage id={'RegistrationForm.reset'} defaultMessage={'Reset'} />
          </BigButton>
        </div>
        <div className={cx('button-register')}>
          <BigButton type={'submit'} color={'organish'}>
            <FormattedMessage id={'RegistrationForm.register'} defaultMessage={'Register'} />
          </BigButton>
        </div>
      </div>
    </form>
  );
};

RegistrationForm.propTypes = {
  submitForm: PropTypes.func,
  resetForm: PropTypes.func,
  intl: intlShape.isRequired,
};
RegistrationForm.defaultProps = {
  submitForm: () => {},
  resetForm: () => {},
};

export default Utils.connectToState({
  submitForm: signal`user.register`,
  resetForm: signal`user.registrationForm.resetForm`,
}, injectIntl(RegistrationForm));
