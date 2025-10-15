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

import { SubmissionError } from 'redux-form';

import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { Folder } from 'controllers/testCase';

import { ManualScenarioDto, ManualScenarioType, CreateTestCaseFormData } from '../types';

export const createFolder = async (projectKey: string, folderName: string): Promise<Folder> => {
  const createdFolder = await fetch<Folder>(URLS.testFolders(projectKey), {
    method: 'POST',
    data: { name: folderName },
  });

  return createdFolder;
};

export const buildManualScenario = (payload: CreateTestCaseFormData): ManualScenarioDto => {
  const commonData = {
    executionEstimationTime: payload.executionEstimationTime,
    linkToRequirements: payload.linkToRequirements,
    manualScenarioType: payload.manualScenarioType,
    preconditions: {
      value: payload.precondition,
      attachments: payload.preconditionAttachments ?? [],
    },
  };

  if (payload.manualScenarioType === ManualScenarioType.TEXT) {
    return {
      ...commonData,
      instructions: payload.instructions,
      expectedResult: payload.expectedResult,
      attachments: payload.textAttachments ?? [],
    };
  }

  return {
    ...commonData,
    steps: Object.values(payload?.steps ?? {}).map((step) => ({
      instructions: step.instructions,
      expectedResult: step.expectedResult,
      attachments: step.attachments ?? [],
    })),
  };
};

export const handleTestCaseError = (
  error: unknown,
  formatMessage: (message: unknown) => string,
  duplicateMessageKey: { id: string; defaultMessage: string },
) => {
  if (error instanceof Error && error?.message?.includes('tms_test_case_name_folder_unique')) {
    throw new SubmissionError({
      name: formatMessage(duplicateMessageKey),
    });
  }
  throw error;
};
