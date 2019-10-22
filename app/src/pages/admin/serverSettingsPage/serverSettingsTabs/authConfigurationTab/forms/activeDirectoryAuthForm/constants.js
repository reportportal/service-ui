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

import {
  LDAP_ATTRIBUTES_KEY,
  LDAP_PREFIX,
  ENABLED_KEY,
  URL_KEY,
} from 'pages/admin/serverSettingsPage/common/constants';

export const DOMAIN_KEY = 'domain';

export const AD_AUTH_TYPE = 'ad';
export const AD_AUTH_FORM = 'activeDirectoryAuthForm';
export const DEFAULT_FORM_CONFIG = {
  [ENABLED_KEY]: false,
  [LDAP_ATTRIBUTES_KEY]: {
    [URL_KEY]: LDAP_PREFIX,
  },
};
