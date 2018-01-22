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
import modules from './modules/modules';
import login from './signals/login';
import logout from './signals/logout';
import register from './signals/register';
import forgotPass from './signals/forgotPass';
import updateUserStatus from './signals/updateUserStatus';
import setUserToken from './signals/setUserToken';
import forgotPassRoute from './signals/forgotPassRoute';
import loginRoute from './signals/loginRoute';
import registrationRoute from './signals/registrationRoute';

export default Module({
  state: {
    auth: false,
    isLoad: false,
    isReady: false,
    token: '',
    data: {},
    registrationTokenData: {
      isLoad: false,
      isReady: false,
      isTokenActive: false,
      isTokenProvided: false,
      uuid: '',
      email: '',
    },
  },
  signals: {
    setUserToken,
    login,
    logout,
    register,
    forgotPass,
    updateUserStatus,
    forgotPassRoute,
    loginRoute,
    registrationRoute,
  },
  modules,
});
