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

import { useDispatch, useSelector } from 'react-redux';
import { SubmissionError } from 'redux-form';
import { useIntl } from 'react-intl';
import { isString } from 'es-toolkit/compat';

import { projectKeySelector } from 'controllers/project';
import { fetch } from 'common/utils';
import { useDebouncedSpinner } from 'common/hooks';
import { URLS } from 'common/urls';
import { hideModalAction } from 'controllers/modal';
import { showErrorNotification, showSuccessNotification } from 'controllers/notification';
import { getTestCasesAction, Folder } from 'controllers/testCase';
import { createFoldersSuccessAction } from 'controllers/testCase/actionCreators';

import { CreateTestCaseFormData, ManualScenarioType } from './createTestCaseModal';
import { messages } from './basicInformation/messages';

export interface Attachment {
  id: string;
}

export interface TestStep {
  instructions: string;
  expectedResult: string;
  attachments?: Attachment[];
}

const testFolderId = 85;

interface ManualScenarioCommon {
  executionEstimationTime: number;
  linkToRequirements: string;
  manualScenarioType: ManualScenarioType;
  preconditions: {
    value: string;
    attachments?: Attachment[];
  };
}

interface ManualScenarioSteps extends ManualScenarioCommon {
  steps: TestStep[];
}

interface ManualScenarioText extends ManualScenarioCommon {
  instructions?: string;
  expectedResult?: string;
  attachments?: Attachment[];
}

type ManualScenarioDto = ManualScenarioSteps | ManualScenarioText;

export const useCreateTestCase = () => {
  const { isLoading: isCreateTestCaseLoading, showSpinner, hideSpinner } = useDebouncedSpinner();
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);
  const { formatMessage } = useIntl();

  const createFolder = async (folderName: string): Promise<number> => {
    const createdFolder = await fetch<Folder>(URLS.testFolders(projectKey), {
      method: 'POST',
      data: { name: folderName },
    });

    dispatch(createFoldersSuccessAction({ ...createdFolder, countOfTestCases: 0 }));

    return createdFolder.id;
  };

  const resolveFolderId = async (folder: string | { id: number } | undefined): Promise<number> => {
    if (isString(folder)) {
      return createFolder(folder);
    }

    return folder?.id || testFolderId;
  };

  const createTestCase = async (payload: CreateTestCaseFormData) => {
    try {
      showSpinner();

      const folderId = await resolveFolderId(payload.folder);

      const commonData = {
        executionEstimationTime: payload.executionEstimationTime,
        linkToRequirements: payload.linkToRequirements,
        manualScenarioType: payload.manualScenarioType,
        preconditions: {
          value: payload.precondition,
          attachments: payload.preconditionAttachments ?? [],
        },
      };

      const manualScenario: ManualScenarioDto =
        payload.manualScenarioType === 'TEXT'
          ? {
              ...commonData,
              instructions: payload.instructions,
              expectedResult: payload.expectedResult,
              attachments: payload.textAttachments ?? [],
            }
          : {
              ...commonData,
              steps: Object.values(payload?.steps ?? {}).map((step) => ({
                instructions: step.instructions,
                expectedResult: step.expectedResult,
                attachments: step.attachments ?? [],
              })),
            };

      await fetch(URLS.testCase(projectKey), {
        method: 'post',
        data: {
          description: payload.description,
          name: payload.name,
          testFolderId: folderId,
          priority: payload.priority.toUpperCase(),
          manualScenario,
        },
      });

      dispatch(hideModalAction());
      dispatch(
        showSuccessNotification({
          messageId: 'testCaseCreatedSuccess',
        }),
      );
      dispatch(getTestCasesAction({ testFolderId: folderId }));
    } catch (error: unknown) {
      if (error instanceof Error && error?.message?.includes('tms_test_case_name_folder_unique')) {
        throw new SubmissionError({
          name: formatMessage(messages.duplicateTestCaseName),
        });
      } else {
        dispatch(
          showErrorNotification({
            messageId: 'testCaseCreationFailed',
          }),
        );
      }
    } finally {
      hideSpinner();
    }
  };

  return {
    isCreateTestCaseLoading,
    createTestCase,
  };
};
