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

import { Module } from 'cerebral';
import resetForm from './signals/resetForm';

export default Module({
  state: {
    login: {
      value: '',
      defaultValue: '',
      isRequired: true,
      forceInvalid: false,
      validationRules: [
        /^[0-9a-zA-Z-_.]{1,128}$/,
        'minLength:1',
        'maxLength:128',
      ],
      errorMessageId: 'loginHint',
    },
    name: {
      value: '',
      defaultValue: '',
      isRequired: true,
      validationRules: [
        /^[a-z0-9._\-\s\u0400-\u04FF]{3,256}$/i,
        'minLength:3',
        'maxLength:256',
      ],
      errorMessageId: 'nameHint',
    },
    email: {
      value: '',
      defaultValue: '',
      isRequired: true,
      disabled: true,
      validationRules: ['isEmail'],
    },
    password: {
      value: '',
      defaultValue: '',
      isRequired: true,
      validationRules: [
        /^(.){4,25}$/,
        'minLength:4',
        'maxLength:25',
      ],
      errorMessageId: 'passwordHint',
    },
    confirmPassword: {
      value: '',
      defaultValue: '',
      isRequired: true,
      validationRules: [
        /^(.){4,25}$/,
        'minLength:4',
        'maxLength:25',
        'equalsField:user.registrationForm.password',
      ],
      errorMessageId: 'confirmPasswordHint',
    },
    isLoad: false,
    isValid: true,
  },
  signals: {
    resetForm,
  },
});
