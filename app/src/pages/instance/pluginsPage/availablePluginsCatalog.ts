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
  // English-only until Product supplies translations (US-PLG-005).
  description: string;
}

// Hardcoded "Available to install" catalog (EPMRPP-114877 / US-PLG-004 + descriptions US-PLG-005).
// `name` matches the server plugin name (GET /api/v1/plugin) to detect already installed entries.
// Icons are resolved via PLUGIN_IMAGES_MAP in integrations/constants.js.
export const AVAILABLE_PLUGINS_CATALOG: AvailablePlugin[] = [
  {
    name: JIRA,
    tier: PLUGIN_TIERS.FREE,
    groupType: BTS_GROUP_TYPE,
    details: { name: 'Jira Server' },
    description:
      'The integration provides an exchange of information between ReportPortal and the Jira Server, such as posting issues and linking issues, getting updates on their statuses.',
  },
  {
    name: JIRA_CLOUD,
    tier: PLUGIN_TIERS.FREE,
    groupType: BTS_GROUP_TYPE,
    details: { name: 'Jira Cloud' },
    description:
      'The integration provides an exchange of information between ReportPortal and the Jira Cloud, such as posting issues and linking issues, getting updates on their statuses.',
  },
  {
    name: AZURE_DEV_OPS,
    tier: PLUGIN_TIERS.FREE,
    groupType: BTS_GROUP_TYPE,
    details: { name: 'Azure DevOps' },
    description:
      'The integration provides an exchange of information between ReportPortal and the Azure DevOps, such as posting issues and linking issues, getting updates on their statuses.',
  },
  {
    name: GITLAB,
    tier: PLUGIN_TIERS.FREE,
    groupType: BTS_GROUP_TYPE,
    details: { name: 'GitLab' },
    description:
      'The integration provides an exchange of information between ReportPortal and the GitLab, such as posting issues and linking issues, getting updates on their statuses.',
  },
  {
    name: MONDAY,
    tier: PLUGIN_TIERS.FREE,
    groupType: BTS_GROUP_TYPE,
    details: { name: 'Monday' },
    description:
      'The integration provides an exchange of information between ReportPortal and the Monday, such as posting issues and linking issues, getting updates on their statuses.',
  },
  {
    name: RALLY,
    tier: PLUGIN_TIERS.FREE,
    groupType: BTS_GROUP_TYPE,
    details: { name: 'Rally' },
    description:
      'The integration provides an exchange of information between ReportPortal and the Rally, such as posting issues and linking issues, getting updates on their statuses.',
  },
  {
    name: SAUCE_LABS,
    tier: PLUGIN_TIERS.FREE,
    groupType: OTHER_GROUP_TYPE,
    details: { name: 'Sauce Labs' },
    description:
      'Configure an integration with Sauce Labs and watch video of test executions right in the ReportPortal application. For that carry out three easy steps: 1. Configure an integration with Sauce Labs 2. Add attributes to test items SLID: N (where N - # of job in Sauce Labs) and SLDC: M (where M is US or EU) 3. Watch video on the log level.',
  },
  {
    name: SLACK,
    tier: PLUGIN_TIERS.FREE,
    groupType: NOTIFICATION_GROUP_TYPE,
    details: { name: 'Slack' },
    description:
      'Reinforce your ReportPortal instance with Slack integration. Be informed about test result finish in real time in your Slack channel.',
  },
  {
    name: TELEGRAM,
    tier: PLUGIN_TIERS.FREE,
    groupType: NOTIFICATION_GROUP_TYPE,
    details: { name: 'Telegram' },
    description:
      'Reinforce your ReportPortal instance with Telegram integration. Be informed about test result finish in real time in your Telegram channel.',
  },
  {
    name: JUNIT,
    tier: PLUGIN_TIERS.FREE,
    groupType: IMPORT_GROUP_TYPE,
    details: { name: 'JUnit' },
    description:
      'Reinforce you ReportPortal instance with JUnit import functionality and easily upload your log files right to ReportPortal.',
  },
  {
    name: ROBOT_FRAMEWORK,
    tier: PLUGIN_TIERS.FREE,
    groupType: IMPORT_GROUP_TYPE,
    details: { name: 'Robot Framework' },
    description:
      'Reinforce your ReportPortal instance with RobotFramework Import functionality and easily upload your log files right to ReportPortal.',
  },
  {
    name: MOBITRU,
    tier: PLUGIN_TIERS.FREE,
    groupType: OTHER_GROUP_TYPE,
    details: { name: 'Mobitru' },
    description:
      'Reinforce your ReportPortal instance with Mobitru integration and watch video of test executions right in the ReportPortal application.',
  },
  {
    name: GITHUB,
    tier: PLUGIN_TIERS.FREE,
    groupType: AUTHORIZATION_GROUP_TYPE,
    details: { name: 'GitHub Auth' },
    description:
      'Integration with GitHub, can help to speed up the process of user creation and login to ReportPortal. Integration provides an exchange of information between ReportPortal and GitHub, such as possibility to login to ReportPortal with GitHub credentials.',
  },
  {
    name: QUALITY_GATE,
    tier: PLUGIN_TIERS.PREMIUM,
    groupType: OTHER_GROUP_TYPE,
    details: { name: 'Quality Gate' },
    description:
      'Quality Gate plugin helps users to speed up CI/CD pipeline. You will be able to create acceptance criteria for a build, and in case it meets all requirements, ReportPortal automatically will promote the build to the next stage. Otherwise, the system provides a detailed report with information about why a build fails that helps you to reduce the time for build fixing.',
  },
  {
    name: LDAP,
    tier: PLUGIN_TIERS.PREMIUM,
    groupType: AUTHORIZATION_GROUP_TYPE,
    details: { name: 'LDAP Auth' },
    description:
      'Integration with LDAP, can be help to speed up the process user creation and login to ReportPortal. Integration provides an exchange of information between ReportPortal and LDAP, such as possibility to login to ReportPortal with LDAP credentials.',
  },
  {
    name: SAML,
    tier: PLUGIN_TIERS.PREMIUM,
    groupType: AUTHORIZATION_GROUP_TYPE,
    details: { name: 'SAML Auth' },
    description:
      'Integration with SAML, can be help to speed up the process user creation and login to ReportPortal. Integration provides an exchange of information between ReportPortal and SAML, such as possibility to login to ReportPortal with SAML credentials.',
  },
  {
    name: TEST_EXECUTION,
    tier: PLUGIN_TIERS.PREMIUM,
    groupType: OTHER_GROUP_TYPE,
    details: { name: 'Test Executions' },
    description:
      'Reinforce your ReportPortal instance with Test executions plugin. Enable users to quickly find, analyze, and manage individual test cases across multiple launches without navigating through hierarchical launch structures.',
  },
  {
    name: ORGANIZATION,
    tier: PLUGIN_TIERS.PREMIUM,
    groupType: OTHER_GROUP_TYPE,
    details: { name: 'Organizations' },
    description:
      'Reinforce your ReportPortal instance with Organizations plugin. Enable administrators to create and manage organizations, structure projects and users under organizational boundaries, and browse, search, filter, and export the organization list from the instance level.',
  },
];
