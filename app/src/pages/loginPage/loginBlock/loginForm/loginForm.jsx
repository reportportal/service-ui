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
import FieldWithIcon from 'components/fields/fieldWithIcon/fieldWithIcon';
import FieldErrorHint from 'components/fields/fieldErrorHint/fieldErrorHint';
import { state, signal } from 'cerebral/tags';
import { form } from '@cerebral/forms';
import Input from 'components/inputs/input/input';
import BigButton from 'components/buttons/bigButton/bigButton';
import PropTypes from 'prop-types';
import LoginIcon from './img/login-field-icon.svg';
import PasswordIcon from './img/password-field-icon.svg';
import styles from './loginForm.scss';
import ExternalLoginBlock from './externalLoginBlock/externalLoginBlock';

const cx = classNames.bind(styles);

const LoginForm = ({ submitForm }) => {
  const submitHandler = (e) => {
    e.preventDefault();
    submitForm();
  };
  return (
    <form className={cx('login-form')} onSubmit={submitHandler}>
      <ExternalLoginBlock />
      <div className={cx('separator')}>
        <div className={cx('line')} />
        <div className={cx('or')}>or</div>
      </div>
      <div className={cx('login-field')}>
        <FieldErrorHint formPath={'user.loginForm'} fieldName={'login'} >
          <FieldWithIcon icon={LoginIcon}>
            <Input />
          </FieldWithIcon>
        </FieldErrorHint>
      </div>
      <div className={cx('password-field')}>
        <FieldErrorHint formPath={'user.loginForm'} fieldName={'password'} >
          <FieldWithIcon icon={PasswordIcon}>
            <Input type={'password'} />
          </FieldWithIcon>
        </FieldErrorHint>
      </div>
      <div className={cx('forgot-pass')}>Forgot password?</div>
      <div className={cx('login-button-container')}>
        <BigButton type={'submit'} color={'organish'}>Login</BigButton>
      </div>
    </form>
  );
};

LoginForm.propTypes = {
  externalAuth: PropTypes.object,
  submitForm: PropTypes.func,
};
LoginForm.defaultProps = {
  submitForm: () => {},
  externalAuth: {},
};

export default Utils.connectToState({
  submitForm: signal`user.loginForm.submitForm`,
  externalAuth: state`app.info.data.UAT.auth_extensions`,
}, LoginForm);
