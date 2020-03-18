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
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { AD, EMAIL, JIRA, LDAP, RALLY, SAML, SAUCE_LABS } from 'common/constants/pluginNames';
import { SauceLabsSettings } from './integrationProviders/sauceLabsIntegration/sauceLabsSettings';
import { EmailSettings } from './integrationProviders/emailIntegration/emailSettings';
import { JiraSettings } from './integrationProviders/jiraIntegration/jiraSettings';
import { RallySettings } from './integrationProviders/rallyIntegration/rallySettings';
import { SamlSettings } from './integrationProviders/samlIntegration/samlSettings';
import { LdapSettings } from './integrationProviders/ldapIntegration/ldapSettings';
import { ActiveDirectorySettings } from './integrationProviders/activeDirectoryIntegration/activeDirectorySettings';

export const INTEGRATIONS_SETTINGS_COMPONENTS_MAP = {
  [SAUCE_LABS]: SauceLabsSettings,
  [EMAIL]: EmailSettings,
  [JIRA]: JiraSettings,
  [RALLY]: RallySettings,
  [SAML]: SamlSettings,
  [LDAP]: LdapSettings,
  [AD]: ActiveDirectorySettings,
};
