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
  liveUnsupportedPipeline: {
    id: 'PipelineSettings.liveUnsupportedPipeline',
    defaultMessage: 'Auto-Ready applies to Test Case generation pipelines.',
  },
  liveUnavailable: {
    id: 'PipelineSettings.liveUnavailable',
    defaultMessage: 'Pipeline settings are unavailable until the pipeline catalog is loaded.',
  },
  liveContextChanged: {
    id: 'PipelineSettings.liveContextChanged',
    defaultMessage: 'Reopen pipeline settings from the current iteration.',
  },
  liveLoading: {
    id: 'PipelineSettings.liveLoading',
    defaultMessage: 'Loading pipeline settings…',
  },
  liveLoadError: {
    id: 'PipelineSettings.liveLoadError',
    defaultMessage: 'Failed to load pipeline settings.',
  },
  liveRetry: {
    id: 'PipelineSettings.liveRetry',
    defaultMessage: 'Retry',
  },
  liveNoSettings: {
    id: 'PipelineSettings.liveNoSettings',
    defaultMessage: 'The API did not provide Auto-Ready settings for this pipeline.',
  },
  liveVerifyError: {
    id: 'PipelineSettings.liveVerifyError',
    defaultMessage: 'Failed to reload pipeline settings after saving.',
  },
  liveSettingsChanged: {
    id: 'PipelineSettings.liveSettingsChanged',
    defaultMessage: 'The API returned different settings after saving.',
  },
  resetAutoReady: {
    id: 'PipelineSettings.resetAutoReady',
    defaultMessage: 'Reset Auto-Ready',
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
  ciTitle: { id: 'PipelineSettings.ciTitle', defaultMessage: 'CI connection' },
  ciOnlyForManagers: {
    id: 'PipelineSettings.ciOnlyForManagers',
    defaultMessage: 'Organization Managers and Administrators only',
  },
  ciDescription: {
    id: 'PipelineSettings.ciDescription',
    defaultMessage:
      'Connect this pipeline to its GitLab project so ReportPortal can start its jobs.',
  },
  ciGenerationDescription: {
    id: 'PipelineSettings.ciGenerationDescription',
    defaultMessage:
      'Connect this pipeline to its GitLab project so ReportPortal can push fixes to the agent and retry failed stages.',
  },
  ciAutomationDescription: {
    id: 'PipelineSettings.ciAutomationDescription',
    defaultMessage:
      'Connect this pipeline to its GitLab project so ReportPortal can start automation jobs for Ready Test Cases.',
  },
  ciNotConnected: {
    id: 'PipelineSettings.ciNotConnected',
    defaultMessage: 'Not connected to CI',
  },
  ciConnected: { id: 'PipelineSettings.ciConnected', defaultMessage: 'Connected' },
  ciConnectionFailed: {
    id: 'PipelineSettings.ciConnectionFailed',
    defaultMessage: 'CI connection failed',
  },
  ciStatusUnavailable: {
    id: 'PipelineSettings.ciStatusUnavailable',
    defaultMessage: 'CI connection status unavailable',
  },
  ciProvider: { id: 'PipelineSettings.ciProvider', defaultMessage: 'CI provider' },
  ciRepository: { id: 'PipelineSettings.ciRepository', defaultMessage: 'Repository' },
  ciRepositoryHint: {
    id: 'PipelineSettings.ciRepositoryHint',
    defaultMessage: 'Enter the HTTPS URL of the GitLab project.',
  },
  ciBranch: { id: 'PipelineSettings.ciBranch', defaultMessage: 'Branch' },
  ciCredential: { id: 'PipelineSettings.ciCredential', defaultMessage: 'Trigger credential' },
  ciCredentialHint: {
    id: 'PipelineSettings.ciCredentialHint',
    defaultMessage: 'Paste credential',
  },
  ciCredentialReplace: {
    id: 'PipelineSettings.ciCredentialReplace',
    defaultMessage: 'New credential',
  },
  ciCredentialForNewRepository: {
    id: 'PipelineSettings.ciCredentialForNewRepository',
    defaultMessage: 'Enter a credential for the new GitLab server.',
  },
  ciCredentialSaved: {
    id: 'PipelineSettings.ciCredentialSaved',
    defaultMessage: 'Credential saved',
  },
  ciSavedLabel: { id: 'PipelineSettings.ciSavedLabel', defaultMessage: 'saved' },
  ciCredentialHidden: {
    id: 'PipelineSettings.ciCredentialHidden',
    defaultMessage: 'Never shown again after saving',
  },
  ciRemove: { id: 'PipelineSettings.ciRemove', defaultMessage: 'Remove' },
  ciReplace: { id: 'PipelineSettings.ciReplace', defaultMessage: 'Replace' },
  ciCancelReplacement: {
    id: 'PipelineSettings.ciCancelReplacement',
    defaultMessage: 'Cancel replacement',
  },
  ciInheritedCredential: {
    id: 'PipelineSettings.ciInheritedCredential',
    defaultMessage:
      'The project integration supplies this credential. Enter a credential to use with the pipeline’s own settings.',
  },
  ciRemoveCredential: {
    id: 'PipelineSettings.ciRemoveCredential',
    defaultMessage: 'Remove credential',
  },
  ciRemoveCredentialFailed: {
    id: 'PipelineSettings.ciRemoveCredentialFailed',
    defaultMessage: 'Failed to remove the trigger credential.',
  },
  ciCredentialRemoved: {
    id: 'PipelineSettings.ciCredentialRemoved',
    defaultMessage: 'Trigger credential removed.',
  },
  ciCredentialStillSaved: {
    id: 'PipelineSettings.ciCredentialStillSaved',
    defaultMessage: 'The pipeline still has access to a saved trigger credential.',
  },
  ciGenerationJob: { id: 'PipelineSettings.ciGenerationJob', defaultMessage: 'Generation job' },
  ciFixJob: { id: 'PipelineSettings.ciFixJob', defaultMessage: 'Fix job' },
  ciAutomationJob: { id: 'PipelineSettings.ciAutomationJob', defaultMessage: 'Automation job' },
  ciJobNameRequired: {
    id: 'PipelineSettings.ciJobNameRequired',
    defaultMessage: 'Enter a job name.',
  },
  ciJobs: { id: 'PipelineSettings.ciJobs', defaultMessage: 'Jobs' },
  ciJobsHint: {
    id: 'PipelineSettings.ciJobsHint',
    defaultMessage: 'Enter comma-separated purpose=job pairs with distinct purposes.',
  },
  ciModels: { id: 'PipelineSettings.ciModels', defaultMessage: 'Models' },
  ciEnvironments: { id: 'PipelineSettings.ciEnvironments', defaultMessage: 'Environments' },
  ciOrderedListHint: {
    id: 'PipelineSettings.ciOrderedListHint',
    defaultMessage: 'Separate values with commas. The first is the default.',
  },
  ciAutomationEnvironmentsHint: {
    id: 'PipelineSettings.ciAutomationEnvironmentsHint',
    defaultMessage:
      'Shown in Send to automation. Separate values with commas. The first is the default.',
  },
  ciOrderedListError: {
    id: 'PipelineSettings.ciOrderedListError',
    defaultMessage: 'Enter at least one value and remove duplicates.',
  },
  ciSave: { id: 'PipelineSettings.ciSave', defaultMessage: 'Save' },
  ciSaved: {
    id: 'PipelineSettings.ciSaved',
    defaultMessage: 'CI connection settings saved.',
  },
  ciSaveFailed: {
    id: 'PipelineSettings.ciSaveFailed',
    defaultMessage: 'Failed to save the CI connection settings.',
  },
  ciTest: { id: 'PipelineSettings.ciTest', defaultMessage: 'Test connection' },
  ciTestHint: {
    id: 'PipelineSettings.ciTestHint',
    defaultMessage:
      'Test connection checks the saved repository and credential. Job names are not verified.',
  },
  ciSaveBeforeTest: {
    id: 'PipelineSettings.ciSaveBeforeTest',
    defaultMessage: 'Save your changes before testing the connection.',
  },
  ciTestFailed: {
    id: 'PipelineSettings.ciTestFailed',
    defaultMessage: 'Could not complete the connection test.',
  },
  ciTestResult: {
    id: 'PipelineSettings.ciTestResult',
    defaultMessage: 'Test connection result',
  },
  ciCheckedAt: {
    id: 'PipelineSettings.ciCheckedAt',
    defaultMessage: 'Checked {date, date, medium} at {date, time, short}',
  },
  ciLoad: { id: 'PipelineSettings.ciLoad', defaultMessage: 'Loading CI connection…' },
  ciLoadFailed: {
    id: 'PipelineSettings.ciLoadFailed',
    defaultMessage: 'Failed to load the CI connection.',
  },
  ciNoCredential: {
    id: 'PipelineSettings.ciNoCredential',
    defaultMessage: 'No trigger credential is saved.',
  },
  ciInvalidRepositoryOrCredential: {
    id: 'PipelineSettings.ciInvalidRepositoryOrCredential',
    defaultMessage: 'GitLab did not accept the repository or trigger credential.',
  },
  ciUnreachable: {
    id: 'PipelineSettings.ciUnreachable',
    defaultMessage: 'GitLab could not be reached.',
  },
  ciUnexpectedResponse: {
    id: 'PipelineSettings.ciUnexpectedResponse',
    defaultMessage: 'GitLab returned an unexpected response.',
  },
});
