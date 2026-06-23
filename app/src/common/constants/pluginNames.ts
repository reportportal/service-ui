/*
 * Copyright 2026 EPAM Systems
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
export const JIRA_CLOUD = 'JIRA Cloud';
export const AZURE_DEV_OPS = 'Azure DevOps';
export const GITLAB = 'GitLab';
export const MONDAY = 'Monday';
export const RALLY = 'rally';
export const EMAIL = 'email';
export const SLACK = 'slack';
export const TELEGRAM = 'telegram';
export const SAUCE_LABS = 'saucelabs';
export const SAUCE_LABS_TITLE = 'Sauce Labs';
export const MOBITRU = 'mobitru';
export const JUNIT = 'junit';
export const ROBOT_FRAMEWORK = 'RobotFramework';
export const SAML = 'saml';
export const LDAP = 'ldap';
export const GITHUB = 'github';
export const ORGANIZATION = 'organization';
export const QUALITY_GATE = 'quality gate';
export const TEST_EXECUTION = 'test-execution';

// TODO: calculate it dynamically
export const PLUGIN_NAMES_BY_GROUP_TYPES_MAP = {
  [BTS_GROUP_TYPE]: [JIRA, RALLY],
  [NOTIFICATION_GROUP_TYPE]: [EMAIL],
  [OTHER_GROUP_TYPE]: [SAUCE_LABS, MOBITRU],
  [AUTHORIZATION_GROUP_TYPE]: [SAML, LDAP, GITHUB],
};

// TODO: calculate it dynamically
export const GROUP_TYPES_BY_PLUGIN_NAMES_MAP = {
  [JIRA]: BTS_GROUP_TYPE,
  [RALLY]: BTS_GROUP_TYPE,
  [EMAIL]: NOTIFICATION_GROUP_TYPE,
  [SAML]: AUTHORIZATION_GROUP_TYPE,
  [LDAP]: AUTHORIZATION_GROUP_TYPE,
  [GITHUB]: AUTHORIZATION_GROUP_TYPE,
  [SAUCE_LABS]: OTHER_GROUP_TYPE,
  [MOBITRU]: OTHER_GROUP_TYPE,
};
