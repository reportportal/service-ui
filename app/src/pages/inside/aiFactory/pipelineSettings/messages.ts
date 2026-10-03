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
  action: {
    id: 'PipelineSettings.action',
    defaultMessage: 'Pipeline settings',
  },
  title: {
    id: 'PipelineSettings.title',
    defaultMessage: 'Pipeline settings',
  },
  autoReady: {
    id: 'PipelineSettings.autoReady',
    defaultMessage: 'Auto-Ready',
  },
  autoReadyDescription: {
    id: 'PipelineSettings.autoReadyDescription',
    defaultMessage:
      'Automatically mark eligible Draft Test Cases as Ready after a successful evaluation.',
  },
  threshold: {
    id: 'PipelineSettings.threshold',
    defaultMessage: 'Quality threshold',
  },
  thresholdHelp: {
    id: 'PipelineSettings.thresholdHelp',
    defaultMessage: 'Whole number from 0 to 100',
  },
  thresholdError: {
    id: 'PipelineSettings.thresholdError',
    defaultMessage: 'Threshold must be a whole number from 0 to 100',
  },
  appliesNext: {
    id: 'PipelineSettings.appliesNext',
    defaultMessage: 'Changes apply from the next upload or fix round.',
  },
  readOnly: {
    id: 'PipelineSettings.readOnly',
    defaultMessage:
      'You can view these settings. Only an Organization Manager or Administrator can change them.',
  },
  automationNoSettings: {
    id: 'PipelineSettings.automationNoSettings',
    defaultMessage: '{pipelineName} has no settings in the PoC.',
  },
  updateSuccess: {
    id: 'PipelineSettings.updateSuccess',
    defaultMessage: 'Pipeline settings were updated',
  },
  updateFailed: {
    id: 'PipelineSettings.updateFailed',
    defaultMessage: 'Failed to update pipeline settings',
  },
});
