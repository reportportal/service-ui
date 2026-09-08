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
  IMPORT_GROUP_TYPE,
  OTHER_GROUP_TYPE,
} from 'common/constants/pluginsGroupTypes';
import {
  JIRA,
  JIRA_CLOUD,
  AZURE_DEV_OPS,
  GITLAB,
  MONDAY,
  RALLY,
  SLACK,
  TELEGRAM,
  SAUCE_LABS,
  MOBITRU,
  JUNIT,
  ROBOT_FRAMEWORK,
  QUALITY_GATE,
  LDAP,
  SAML,
  GITHUB,
  TEST_EXECUTION,
  ORGANIZATION,
} from 'common/constants/pluginNames';

export const PLUGIN_TIERS = {
  FREE: 'free',
  PREMIUM: 'premium',
} as const;

export type PluginTier = (typeof PLUGIN_TIERS)[keyof typeof PLUGIN_TIERS];

export interface AvailablePlugin {
  name: string;
  tier: PluginTier;
  groupType: string;
  details: {
    name: string;
  };
}

// Hardcoded "Available to install" catalog (EPMRPP-114877 / US-PLG-004).
// `name` matches the server plugin name (GET /api/v1/plugin) to detect already installed entries.
// Icons are resolved via PLUGIN_IMAGES_MAP in integrations/constants.js.
export const AVAILABLE_PLUGINS_CATALOG: AvailablePlugin[] = [
  {
    name: JIRA,
    tier: PLUGIN_TIERS.FREE,
    groupType: BTS_GROUP_TYPE,
    details: { name: 'Jira Server' },
  },
  {
    name: JIRA_CLOUD,
    tier: PLUGIN_TIERS.FREE,
    groupType: BTS_GROUP_TYPE,
    details: { name: 'Jira Cloud' },
  },
  {
    name: AZURE_DEV_OPS,
    tier: PLUGIN_TIERS.FREE,
    groupType: BTS_GROUP_TYPE,
    details: { name: 'Azure DevOps' },
  },
  {
    name: GITLAB,
    tier: PLUGIN_TIERS.FREE,
    groupType: BTS_GROUP_TYPE,
    details: { name: 'GitLab' },
  },
  {
    name: MONDAY,
    tier: PLUGIN_TIERS.FREE,
    groupType: BTS_GROUP_TYPE,
    details: { name: 'Monday' },
  },
  {
    name: RALLY,
    tier: PLUGIN_TIERS.FREE,
    groupType: BTS_GROUP_TYPE,
    details: { name: 'Rally' },
  },
  {
    name: SAUCE_LABS,
    tier: PLUGIN_TIERS.FREE,
    groupType: OTHER_GROUP_TYPE,
    details: { name: 'Sauce Labs' },
  },
  {
    name: SLACK,
    tier: PLUGIN_TIERS.FREE,
    groupType: NOTIFICATION_GROUP_TYPE,
    details: { name: 'Slack' },
  },
  {
    name: TELEGRAM,
    tier: PLUGIN_TIERS.FREE,
    groupType: NOTIFICATION_GROUP_TYPE,
    details: { name: 'Telegram' },
  },
  {
    name: JUNIT,
    tier: PLUGIN_TIERS.FREE,
    groupType: IMPORT_GROUP_TYPE,
    details: { name: 'JUnit' },
  },
  {
    name: ROBOT_FRAMEWORK,
    tier: PLUGIN_TIERS.FREE,
    groupType: IMPORT_GROUP_TYPE,
    details: { name: 'Robot Framework' },
  },
  {
    name: MOBITRU,
    tier: PLUGIN_TIERS.FREE,
    groupType: OTHER_GROUP_TYPE,
    details: { name: 'Mobitru' },
  },
  {
    name: GITHUB,
    tier: PLUGIN_TIERS.FREE,
    groupType: AUTHORIZATION_GROUP_TYPE,
    details: { name: 'GitHub Auth' },
  },
  {
    name: QUALITY_GATE,
    tier: PLUGIN_TIERS.PREMIUM,
    groupType: OTHER_GROUP_TYPE,
    details: { name: 'Quality Gate' },
  },
  {
    name: LDAP,
    tier: PLUGIN_TIERS.PREMIUM,
    groupType: AUTHORIZATION_GROUP_TYPE,
    details: { name: 'LDAP Auth' },
  },
  {
    name: SAML,
    tier: PLUGIN_TIERS.PREMIUM,
    groupType: AUTHORIZATION_GROUP_TYPE,
    details: { name: 'SAML Auth' },
  },
  {
    name: TEST_EXECUTION,
    tier: PLUGIN_TIERS.PREMIUM,
    groupType: OTHER_GROUP_TYPE,
    details: { name: 'Test Executions' },
  },
  {
    name: ORGANIZATION,
    tier: PLUGIN_TIERS.PREMIUM,
    groupType: OTHER_GROUP_TYPE,
    details: { name: 'Organizations' },
  },
];
