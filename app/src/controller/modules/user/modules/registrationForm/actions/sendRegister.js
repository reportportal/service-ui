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

export default ({ state, forms, http, path }) => {
  if (forms.get('user.registrationForm').isValid) {
    state.set('user.registrationForm.isLoad', true);
    return (
      http.post(`/api/v1/user/registration?uuid=${state.get('user.registrationTokenData.uuid')}`, {
        email: state.get('user.registrationForm.email.value'),
        full_name: state.get('user.registrationForm.name.value'),
        login: state.get('user.registrationForm.login.value'),
        password: state.get('user.registrationForm.password.value'),
      })
      .then(() => {
        state.set('user.registrationForm.isLoad', false);
        if (path && path.true) {
          return path.true({
            login: state.get('user.registrationForm.login.value'),
            password: state.get('user.registrationForm.password.value'),
          });
        }
        return {};
      })
      .catch((error) => {
        state.set('user.registrationForm.isLoad', false);
        if (path && path.false) {
          return path.false({ error });
        }
        return { error };
      })
    );
  }
  return path.false();
};
