/*
 * Copyright 2022 EPAM Systems
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
    defaultMessage: 'No integrations',
  },
  noGlobalIntegrationsDescription: {
    id: 'IntegrationsDescription.noGlobalIntegrationsDescription',
    defaultMessage:
      'No Integrations were configured. You can manually setup the integration for this project.',
  },
  noGlobalIntegrationsButtonAdd: {
    id: 'IntegrationsDescription.noGlobalIntegrationsButtonAdd',
    defaultMessage: 'Add Project Integration',
  },
  resetToGlobalIntegrationsButton: {
    id: 'IntegrationsDescription.resetToGlobalIntegrationsButton',
    defaultMessage: 'Reset to Global Integrations',
  },
  backToIntegration: {
    id: 'IntegrationsDescription.backToIntegration',
    defaultMessage: 'Back to Integrations List',
  },
  version: {
    id: 'InfoSection.version',
    defaultMessage: 'version',
  },
  globalIntegrationTitle: {
    id: 'IntegrationsDescription.globalIntegrationTitle',
    defaultMessage: 'Global Integrations',
  },
  globalIntegrationText: {
    id: 'IntegrationsDescription.globalIntegrationText',
    defaultMessage:
      'Global Integrations are created on the instance level and are applied to all projects',
  },

  projectIntegrationTitle: {
    id: 'IntegrationsDescription.projectIntegrationTitle',
    defaultMessage: 'Project Integrations',
  },
  projectIntegrationText: {
    id: 'IntegrationsDescription.projectIntegrationText',
    defaultMessage: 'Project Integrations are created per project',
  },
  projectIntegrationCreate: {
    id: 'IntegrationsDescription.projectIntegrationCreate',
    defaultMessage: 'Create Project Integration',
  },
  projectIntegrationReset: {
    id: 'IntegrationsDescription.projectIntegrationReset',
    defaultMessage: 'Reset to Global Integration',
  },
  projectIntegrationResetDescription: {
    id: 'IntegrationsDescription.projectIntegrationResetDescription',
    defaultMessage:
      'Are you sure you want to reset to Global Integrations? All your Project Integrations will be deleted without the ability to recover.',
  },
  settings: {
    id: 'IntegrationsDescription.settings',
    defaultMessage: 'Settings',
  },
  integrationList: {
    id: 'IntegrationsDescription.integrationList',
    defaultMessage: 'Integration List',
  },
  linkToDocumentation: {
    id: 'IntegrationsDescription.linkToDocumentation',
    defaultMessage: 'Link to <a>Documentation</a>',
  },
});
