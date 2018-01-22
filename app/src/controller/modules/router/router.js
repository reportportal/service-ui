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
import Router from '@cerebral/router';
import changePage from './factories/changePage';
import notAutenticate from './factories/notAutenticate';
import autenticate from './factories/autenticate';
import initialData from './factories/initialData';
import loginPageDataLoad from './factories/loginPageDataLoad';
import registrationTokenData from './factories/registrationTokenData';

export const route = Module({
  state: {
    currentPage: '',
    pageParams: {},
  },
  signals: {
    loginRouted: initialData(notAutenticate(loginPageDataLoad(changePage('login')))),
    forgotPassRouted: initialData(notAutenticate(loginPageDataLoad(changePage('forgotPass')))),
    appRouted: initialData(autenticate(changePage('app'))),
    registrationRouted: registrationTokenData(changePage('registration')),
  },
});

export default Router({
  routes: [
    {
      path: '/',
      signal: 'route.loginRouted',
    },
    {
      path: '/forgotPassword',
      signal: 'route.forgotPassRouted',
    },
    {
      path: '/registration',
      signal: 'route.registrationRouted',
    },
    {
      path: '/app',
      signal: 'route.appRouted',
    },
  ],
});
