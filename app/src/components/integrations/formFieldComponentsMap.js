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
import { SauceLabsFormFields } from './integrationProviders/sauceLabsIntegration/sauceLabsFormFields';
import { EmailFormFields } from './integrationProviders/emailIntegration/emailFormFields';
import { JiraConnectionFormFields } from './integrationProviders/jiraIntegration/jiraConnectionFormFields';
import { RallyConnectionFormFields } from './integrationProviders/rallyIntegration/rallyConnectionFormFields';
import { SamlFormFields } from './integrationProviders/samlIntegration/samlFormFields';
import { LdapFormFields } from './integrationProviders/ldapIntegration/ldapFormFields';
import { ActiveDirectoryFormFields } from './integrationProviders/activeDirectoryIntegration/activeDirectoryFormFields';

export const INTEGRATIONS_FORM_FIELDS_COMPONENTS_MAP = {
  [SAUCE_LABS]: SauceLabsFormFields,
  [EMAIL]: EmailFormFields,
  [JIRA]: JiraConnectionFormFields,
  [RALLY]: RallyConnectionFormFields,
  [SAML]: SamlFormFields,
  [LDAP]: LdapFormFields,
  [AD]: ActiveDirectoryFormFields,
};
