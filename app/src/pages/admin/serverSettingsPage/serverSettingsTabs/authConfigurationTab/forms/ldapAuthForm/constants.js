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

export const MANAGER_DN_KEY = 'managerDn';
export const MANAGER_PASSWORD_KEY = 'managerPassword';
export const USER_DN_PATTERN_KEY = 'userDnPattern';
export const USER_SEARCH_FILTER_KEY = 'userSearchFilter';
export const GROUP_SEARCH_BASE_KEY = 'groupSearchBase';
export const GROUP_SEARCH_FILTER_KEY = 'groupSearchFilter';
export const PASSWORD_ENCODER_TYPE_KEY = 'passwordEncoderType';
export const PASSWORD_ATTRIBUTE_KEY = 'passwordAttribute';

export const LDAP_AUTH_TYPE = 'ldap';
export const LDAP_AUTH_FORM = 'ldapAuthForm';
export const DEFAULT_FORM_CONFIG = {
  [ENABLED_KEY]: false,
  [PASSWORD_ENCODER_TYPE_KEY]: '',
  [LDAP_ATTRIBUTES_KEY]: {
    [URL_KEY]: LDAP_PREFIX,
  },
};
