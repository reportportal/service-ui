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

import { defineMessages } from 'react-intl';

export const messages = defineMessages({
  noGlobalIntegrationsMessage: {
    id: 'IntegrationsDescription.noGlobalIntegrationsMessage',
    defaultMessage: 'No Integrations',
  },
  noGlobalIntegrationsDescription: {
    id: 'IntegrationsDescription.noGlobalIntegrationsDescription',
    defaultMessage:
      'No integrations were configured. You can manually setup the integration for this project.',
  },
  noGlobalIntegrationsYet: {
    id: 'IntegrationsDescription.noGlobalIntegrationsYet',
    defaultMessage: 'No integrations yet',
  },
  noGlobalIntegrationsYetDescription: {
    id: 'IntegrationsDescription.noGlobalIntegrationsYetDescription',
    defaultMessage: 'Integration will appear here once created by your team',
  },
  noGlobalIntegrationsButtonAdd: {
    id: 'IntegrationsDescription.noGlobalIntegrationsButtonAdd',
    defaultMessage: 'Create Project Integration',
  },
  version: {
    id: 'InfoSection.version',
    defaultMessage: 'version',
  },
  globalIntegrationTitle: {
    id: 'IntegrationsDescription.globalIntegrationTitle',
    defaultMessage: 'Global integrations',
  },
  globalIntegrationText: {
    id: 'IntegrationsDescription.globalIntegrationText',
    defaultMessage:
      'Created at the instance level and applied to all projects unless organizational or project-specific configurations are set.',
  },
  projectIntegrationTitle: {
    id: 'IntegrationsDescription.projectIntegrationTitle',
    defaultMessage: 'Project integrations',
  },
  projectIntegrationText: {
    id: 'IntegrationsDescription.projectIntegrationText',
    defaultMessage: 'Default integration configurations for the project.',
  },
  projectIntegrationReset: {
    id: 'IntegrationsDescription.projectIntegrationReset',
    defaultMessage: 'Reset to Global Integrations',
  },
  projectIntegrationResetDescription: {
    id: 'IntegrationsDescription.projectIntegrationResetDescription',
    defaultMessage:
      'Are you sure you want to reset to Global Integrations? All your Project Integrations will be deleted without the ability to recover.',
  },
  projectIntegrationAddLimited: {
    id: 'IntegrationsDescription.projectIntegrationAddLimited',
    defaultMessage: 'Only one project integration can be added',
  },
  integrationList: {
    id: 'IntegrationsDescription.integrationList',
    defaultMessage: 'Integrations',
  },
  linkToDocumentation: {
    id: 'IntegrationsDescription.linkToDocumentation',
    defaultMessage: 'Link to <a>Documentation</a>',
  },
  inactiveGlobalIntegrations: {
    id: 'IntegrationsDescription.inactiveGlobalIntegrations',
    defaultMessage:
      'Global configurations are inactive because a project integration has been configured',
  },
  emptyStateText: {
    id: 'IntegrationsDescription.emptyStateText',
    defaultMessage: 'Integration is not configured yet',
  },
  createIntegration: {
    id: 'IntegrationsDescription.createIntegration',
    defaultMessage: 'Create Integration',
  },
  resetIntegrations: {
    id: 'IntegrationsDescription.resetIntegrations',
    defaultMessage: 'Reset to Global Integration',
  },
});
