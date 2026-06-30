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

import { LDAP } from 'common/constants/pluginNames';
import { API_PATH } from 'common/urls';
import { redirect } from 'redux-first-router';
import { LOGIN_PAGE } from 'controllers/pages';

export const isLdapAuthType = (authType) => authType?.toLowerCase() === LDAP;

export const normalizePathWithPrefix = (path) => {
  if (path.indexOf(API_PATH) === -1) {
    return `${API_PATH}${path}`;
  }
  return path;
};

export const setWindowLocationToNewPath = (path) => {
  window.location = path;
};

export const startSsoAuthFlow = ({ dispatch, authType, val, onExternalRedirect }) => {
  if (!val) {
    return;
  }

  if (isLdapAuthType(authType)) {
    dispatch(redirect({ type: LOGIN_PAGE, payload: { query: { ldapLogin: 'true' } } }));
    return;
  }

  if (val.providers && Object.keys(val.providers).length > 1) {
    dispatch(redirect({ type: LOGIN_PAGE, payload: { query: { multipleAuth: authType } } }));
    return;
  }

  const path = val.path || (val.providers && Object.values(val.providers)[0]);

  if (path) {
    onExternalRedirect?.();
    setWindowLocationToNewPath(normalizePathWithPrefix(path));
  }
};
