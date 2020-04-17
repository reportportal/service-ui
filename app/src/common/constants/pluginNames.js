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
  BTS_GROUP_TYPE,
  NOTIFICATION_GROUP_TYPE,
  AUTHORIZATION_GROUP_TYPE,
  OTHER_GROUP_TYPE,
} from './pluginsGroupTypes';

export const JIRA = 'jira';
export const RALLY = 'rally';
export const EMAIL = 'email';
export const SAUCE_LABS = 'saucelabs';
export const SAML = 'saml';
export const LDAP = 'ldap';
export const AD = 'ad';

export const PLUGIN_NAMES_BY_GROUP_TYPES_MAP = {
  [BTS_GROUP_TYPE]: [JIRA, RALLY],
  [NOTIFICATION_GROUP_TYPE]: [EMAIL],
  [OTHER_GROUP_TYPE]: [SAUCE_LABS],
  [AUTHORIZATION_GROUP_TYPE]: [SAML, LDAP, AD],
};

export const GROUP_TYPES_BY_PLUGIN_NAMES_MAP = {
  [JIRA]: BTS_GROUP_TYPE,
  [RALLY]: BTS_GROUP_TYPE,
  [EMAIL]: NOTIFICATION_GROUP_TYPE,
  [SAML]: AUTHORIZATION_GROUP_TYPE,
  [LDAP]: AUTHORIZATION_GROUP_TYPE,
  [AD]: AUTHORIZATION_GROUP_TYPE,
  [SAUCE_LABS]: OTHER_GROUP_TYPE,
};
