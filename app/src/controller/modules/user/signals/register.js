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

import { when } from 'cerebral/operators';
import { state, props } from 'cerebral/tags';
import { isValidForm } from '@cerebral/forms/operators';
import sendRegister from '../modules/registrationForm/actions/sendRegister';
import handleRegistrationErrors from '../modules/registrationForm/actions/handleErrors';
import highlightInvalidFields from '../modules/registrationForm/actions/highlightInvalidFields';
import loginRoute from './loginRoute';
import fillLoginForm from '../modules/loginForm/actions/fillLoginForm';
import login from './login';

export default [
  sendRegister,
  {
    true: [
      loginRoute,
      fillLoginForm,
      login,
    ],
    false: [
      when(props`error`),
      {
        true: [
          handleRegistrationErrors,
          ({ props: properties, notification }) => {
            notification.errorMessage(properties.error.response.result.message);
          },
        ],
        false: [
          isValidForm(state`user.registrationForm`), {
            true: [],
            false: [
              highlightInvalidFields,
            ],
          },
        ],
      },
    ],
  },
];
