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

import { JIRA, RALLY, EMAIL, SAUCE_LABS, SAML, LDAP, AD } from 'common/constants/pluginNames';
import JiraIcon from 'common/img/plugins/jira.svg';
import RallyIcon from 'common/img/plugins/rally.png';
import EmailIcon from 'common/img/plugins/email.png';
import SauceLabsIcon from 'common/img/plugins/sauce-labs.png';
import SamlIcon from 'common/img/plugins/saml.png';
import LdapIcon from 'common/img/plugins/ldap.png';
import ActiveDirectoryIcon from 'common/img/plugins/activeDirectory.png';

export const PLUGIN_NAME_TITLES = {
  [JIRA]: 'JIRA',
  [RALLY]: 'RALLY',
  [EMAIL]: 'Email Server',
  [SAUCE_LABS]: 'Sauce Labs',
  [SAML]: 'SAML',
  [LDAP]: 'LDAP',
  [AD]: 'Active Directory',
};

export const PLUGIN_IMAGES_MAP = {
  [JIRA]: JiraIcon,
  [RALLY]: RallyIcon,
  [EMAIL]: EmailIcon,
  [SAUCE_LABS]: SauceLabsIcon,
  [SAML]: SamlIcon,
  [LDAP]: LdapIcon,
  [AD]: ActiveDirectoryIcon,
};

export const PLUGINS_SUPPORTS_MULTIPLE_INSTANCES = [JIRA, RALLY, SAML];

export const BUILTIN_PLUGINS = [EMAIL, SAML, LDAP, AD];
