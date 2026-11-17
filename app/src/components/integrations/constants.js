/*
 * Copyright 2025 EPAM Systems
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
  JIRA,
  JIRA_CLOUD,
  AZURE_DEV_OPS,
  GITLAB,
  MONDAY,
  RALLY,
  EMAIL,
  SLACK,
  TELEGRAM,
  SAUCE_LABS,
  MOBITRU,
  SAML,
  LDAP,
  GITHUB,
  TEAMS,
} from 'common/constants/pluginNames';
import JiraIcon from 'common/img/plugins/jira.svg';
import AzureDevOpsIcon from 'common/img/plugins/azure-dev-ops.svg';
import GitLabIcon from 'common/img/plugins/gitlab.svg';
import MondayIcon from 'common/img/plugins/monday.svg';
import RallyIcon from 'common/img/plugins/rally.png';
import EmailIcon from 'common/img/plugins/email.png';
import SlackIcon from 'common/img/plugins/slack.svg';
import TelegramIcon from 'common/img/plugins/telegram.svg';
import SauceLabsIcon from 'common/img/plugins/sauce-labs.svg';
import MobitruIcon from 'common/img/plugins/mobitru.svg';
import SamlIcon from 'common/img/plugins/saml.png';
import LdapIcon from 'common/img/plugins/ldap.png';
import GithubIcon from 'common/img/plugins/github.svg';
import TeamsIcon from 'common/img/plugins/teams.svg';
import DefaultPluginIcon from 'common/img/plugins/default-plugin-icon.svg';

export const PLUGIN_IMAGES_MAP = {
  [JIRA]: JiraIcon,
  [JIRA_CLOUD]: JiraIcon,
  [AZURE_DEV_OPS]: AzureDevOpsIcon,
  [GITLAB]: GitLabIcon,
  [MONDAY]: MondayIcon,
  [RALLY]: RallyIcon,
  [EMAIL]: EmailIcon,
  [SLACK]: SlackIcon,
  [TELEGRAM]: TelegramIcon,
  [SAUCE_LABS]: SauceLabsIcon,
  [MOBITRU]: MobitruIcon,
  [SAML]: SamlIcon,
  [LDAP]: LdapIcon,
  [GITHUB]: GithubIcon,
  [TEAMS]: TeamsIcon,
};

export const PLUGIN_DEFAULT_IMAGE = DefaultPluginIcon;

export const PLUGINS_SUPPORTS_MULTIPLE_INSTANCES = [JIRA, RALLY, SAML];

export const BUILTIN_PLUGINS = [EMAIL];

export const PLUGIN_ICON_TYPES = {
  BASE_64: 'base64',
  URL: 'url',
  SVG: 'svg',
};
