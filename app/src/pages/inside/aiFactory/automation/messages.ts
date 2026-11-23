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

import { SkipReason } from 'types/aiFactory';

export const messages = defineMessages({
  automate: {
    id: 'AiFactoryAutomation.automate',
    defaultMessage: 'Automate',
  },
  send: {
    id: 'AiFactoryAutomation.send',
    defaultMessage: 'Send',
  },
  title: {
    id: 'AiFactoryAutomation.title',
    defaultMessage: 'Send to automation',
  },
  sectionTitle: {
    id: 'AiFactoryAutomation.sectionTitle',
    defaultMessage: 'Automation',
  },
  inProgress: {
    id: 'AiFactoryAutomation.inProgress',
    defaultMessage: 'In progress',
  },
  notAutomated: {
    id: 'AiFactoryAutomation.notAutomated',
    defaultMessage: 'Not automated',
  },
  automated: {
    id: 'AiFactoryAutomation.automated',
    defaultMessage: 'Automated',
  },
  failed: {
    id: 'AiFactoryAutomation.failed',
    defaultMessage: 'Failed',
  },
  unknownStatus: {
    id: 'AiFactoryAutomation.unknownStatus',
    defaultMessage: 'Unknown',
  },
  status: {
    id: 'AiFactoryAutomation.status',
    defaultMessage: 'Status',
  },
  iteration: {
    id: 'AiFactoryAutomation.iteration',
    defaultMessage: 'Iteration #{number}',
  },
  launch: {
    id: 'AiFactoryAutomation.launch',
    defaultMessage: 'Launch #{number}',
  },
  mergeRequest: {
    id: 'AiFactoryAutomation.mergeRequest',
    defaultMessage: 'Merge request',
  },
  mergeRequestOpen: {
    id: 'AiFactoryAutomation.mergeRequestOpen',
    defaultMessage: 'Open',
  },
  mergeRequestMerged: {
    id: 'AiFactoryAutomation.mergeRequestMerged',
    defaultMessage: 'Merged',
  },
  mergeRequestClosed: {
    id: 'AiFactoryAutomation.mergeRequestClosed',
    defaultMessage: 'Closed',
  },
  lastResult: {
    id: 'AiFactoryAutomation.lastResult',
    defaultMessage: 'Last result',
  },
  passed: {
    id: 'AiFactoryAutomation.passed',
    defaultMessage: 'Passed',
  },
  defectType: {
    id: 'AiFactoryAutomation.defectType',
    defaultMessage: 'Defect type: {type}',
  },
  scenarioChanged: {
    id: 'AiFactoryAutomation.scenarioChanged',
    defaultMessage: 'Scenario changed after automation',
  },
  loadingResults: {
    id: 'AiFactoryAutomation.loadingResults',
    defaultMessage: 'Loading automation results',
  },
  updatingResults: {
    id: 'AiFactoryAutomation.updatingResults',
    defaultMessage: 'Updating automation results',
  },
  loadResultsFailed: {
    id: 'AiFactoryAutomation.loadResultsFailed',
    defaultMessage: 'Automation results could not be loaded. Try again.',
  },
  environment: {
    id: 'AiFactoryAutomation.environment',
    defaultMessage: 'Environment',
  },
  environmentSource: {
    id: 'AiFactoryAutomation.environmentSource',
    defaultMessage: 'Environments come from the Test automation pipeline’s CI connection.',
  },
  loadingEnvironments: {
    id: 'AiFactoryAutomation.loadingEnvironments',
    defaultMessage: 'Loading environments',
  },
  selectedSummary: {
    id: 'AiFactoryAutomation.selectedSummary',
    defaultMessage: '{selected} selected · {eligible} eligible',
  },
  testCasesTitle: {
    id: 'AiFactoryAutomation.testCasesTitle',
    defaultMessage: 'Test Cases',
  },
  skippedTitle: {
    id: 'AiFactoryAutomation.skippedTitle',
    defaultMessage: 'Skipped Test Cases',
  },
  reasonNotReady: {
    id: 'AiFactoryAutomation.reasonNotReady',
    defaultMessage: 'Not Ready',
  },
  reasonAlreadyReady: {
    id: 'AiFactoryAutomation.reasonAlreadyReady',
    defaultMessage: 'Already Ready',
  },
  reasonUnsentComments: {
    id: 'AiFactoryAutomation.reasonUnsentComments',
    defaultMessage: 'Has unsent review comments',
  },
  reasonFixRunning: {
    id: 'AiFactoryAutomation.reasonFixRunning',
    defaultMessage: 'Agent is fixing',
  },
  reasonAutomationInProgress: {
    id: 'AiFactoryAutomation.reasonAutomationInProgress',
    defaultMessage: 'Already in automation',
  },
  unavailableNotReady: {
    id: 'AiFactoryAutomation.unavailableNotReady',
    defaultMessage: 'Only Ready Test Cases can be automated',
  },
  previewNotice: {
    id: 'AiFactoryAutomation.previewNotice',
    defaultMessage: 'You can send this Test Case once the automation integration is available.',
  },
  projectChanged: {
    id: 'AiFactoryAutomation.projectChanged',
    defaultMessage: 'The project changed. Open automation from the current project to continue.',
  },
  unavailableCiConnection: {
    id: 'AiFactoryAutomation.unavailableCiConnection',
    defaultMessage: 'The Test automation pipeline cannot start jobs. Check its CI connection.',
  },
  checkingCiConnection: {
    id: 'AiFactoryAutomation.checkingCiConnection',
    defaultMessage: 'Checking the Test automation pipeline’s CI connection',
  },
  loadCiConnectionFailed: {
    id: 'AiFactoryAutomation.loadCiConnectionFailed',
    defaultMessage: 'The Test automation pipeline’s CI connection could not be loaded.',
  },
  unavailableFixRunning: {
    id: 'AiFactoryAutomation.unavailableFixRunning',
    defaultMessage: 'Automation is unavailable while the agent is fixing this Test Case',
  },
  unavailableAutomationInProgress: {
    id: 'AiFactoryAutomation.unavailableAutomationInProgress',
    defaultMessage: 'Automation is already in progress',
  },
  unavailableSelection: {
    id: 'AiFactoryAutomation.unavailableSelection',
    defaultMessage: 'The selected Test Cases cannot be automated',
  },
  confirmTitle: {
    id: 'AiFactoryAutomation.confirmTitle',
    defaultMessage: 'Automate again?',
  },
  confirmAction: {
    id: 'AiFactoryAutomation.confirmAction',
    defaultMessage: 'Automate again',
  },
  confirmCases: {
    id: 'AiFactoryAutomation.confirmCases',
    defaultMessage: 'These Test Cases have already been automated. Confirm to automate them again.',
  },
  loadEnvironmentsFailed: {
    id: 'AiFactoryAutomation.loadEnvironmentsFailed',
    defaultMessage: 'Environments could not be loaded. Try again.',
  },
  environmentsNotConfigured: {
    id: 'AiFactoryAutomation.environmentsNotConfigured',
    defaultMessage: 'Set up environments in the pipeline’s CI connection to continue.',
  },
  invalidEnvironmentsResponse: {
    id: 'AiFactoryAutomation.invalidEnvironmentsResponse',
    defaultMessage: 'The environments response is invalid. Try again.',
  },
  reautomationConfirmationRequired: {
    id: 'AiFactoryAutomation.reautomationConfirmationRequired',
    defaultMessage: 'Confirm re-automation to continue.',
  },
  startFailed: {
    id: 'AiFactoryAutomation.startFailed',
    defaultMessage: 'Automation could not be started. Try again.',
  },
  noEligibleCases: {
    id: 'AiFactoryAutomation.noEligibleCases',
    defaultMessage: 'None of the selected Test Cases can be sent to automation.',
  },
  startNotConfirmed: {
    id: 'AiFactoryAutomation.startNotConfirmed',
    defaultMessage:
      'The start could not be confirmed. Check the Test Cases’ automation status before sending them again.',
  },
  invalidStartResponse: {
    id: 'AiFactoryAutomation.invalidStartResponse',
    defaultMessage:
      'Automation returned an invalid response. Check the Test Cases’ automation status before sending them again.',
  },
  started: {
    id: 'AiFactoryAutomation.started',
    defaultMessage: 'Automation iteration #{number} started for {count} Test Cases',
  },
  startedWithSkipped: {
    id: 'AiFactoryAutomation.startedWithSkipped',
    defaultMessage:
      'Automation iteration #{number} started for {count} Test Cases. Skipped: {cases}',
  },
  startedWithUnconfirmedCases: {
    id: 'AiFactoryAutomation.startedWithUnconfirmedCases',
    defaultMessage:
      'Automation iteration #{number} started for {count} Test Cases. Start not confirmed for: {cases}.',
  },
  retry: {
    id: 'AiFactoryAutomation.retry',
    defaultMessage: 'Retry',
  },
});

export const automationSkipReasonMessages = {
  [SkipReason.NOT_READY]: messages.reasonNotReady,
  [SkipReason.FIX_RUNNING]: messages.reasonFixRunning,
  [SkipReason.AUTOMATION_IN_PROGRESS]: messages.reasonAutomationInProgress,
  [SkipReason.UNSENT_COMMENTS]: messages.reasonUnsentComments,
  [SkipReason.ALREADY_READY]: messages.reasonAlreadyReady,
};

export const automationDisabledMessages = {
  [SkipReason.NOT_READY]: messages.unavailableNotReady,
  [SkipReason.FIX_RUNNING]: messages.unavailableFixRunning,
  [SkipReason.AUTOMATION_IN_PROGRESS]: messages.unavailableAutomationInProgress,
  [SkipReason.UNSENT_COMMENTS]: messages.unavailableNotReady,
  [SkipReason.ALREADY_READY]: messages.unavailableNotReady,
};
