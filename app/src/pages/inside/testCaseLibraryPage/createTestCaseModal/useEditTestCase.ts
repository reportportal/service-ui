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
import { getTestCaseByFolderIdAction, Folder } from 'controllers/testCase';
import { createFoldersSuccessAction } from 'controllers/testCase/actionCreators';

import { messages } from './basicInformation/messages';
import { ManualScenarioDto, ManualScenarioType, CreateTestCaseFormData } from '../types';

export const useEditTestCase = (testCaseId?: number) => {
  const { isLoading: isEditTestCaseLoading, showSpinner, hideSpinner } = useDebouncedSpinner();
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

  const resolveFolderId = async (
    folder: string | { id: number } | undefined,
    currentFolderId?: number,
  ): Promise<number> => {
    if (isString(folder)) {
      return createFolder(folder);
    }

    return folder?.id || currentFolderId || 0;
  };

  const editTestCase = async (payload: CreateTestCaseFormData, currentFolderId?: number) => {
    if (!testCaseId) {
      dispatch(
        showErrorNotification({
          messageId: 'testCaseUpdateFailed',
        }),
      );
      return;
    }

    try {
      showSpinner();

      const folderId = await resolveFolderId(payload.folder, currentFolderId);

      const commonData = {
        executionEstimationTime: payload.executionEstimationTime,
        linkToRequirements: payload.linkToRequirements,
        manualScenarioType: payload.manualScenarioType,
        preconditions: {
          value: payload.precondition,
        },
      };

      const manualScenario: ManualScenarioDto =
        payload.manualScenarioType === ManualScenarioType.TEXT
          ? {
              ...commonData,
              instructions: payload.instructions,
              expectedResult: payload.expectedResult,
            }
          : {
              ...commonData,
              steps: Object.values(payload?.steps ?? {}),
            };

      await fetch(URLS.testCaseDetails(projectKey, testCaseId.toString()), {
        method: 'PUT',
        data: {
          description: payload.description,
          name: payload.name,
          testFolderId: folderId,
          priority: payload.priority.toUpperCase(),
          tags: payload.tags || [],
          manualScenario,
        },
      });

      dispatch(hideModalAction());
      dispatch(
        showSuccessNotification({
          messageId: 'testCaseUpdatedSuccess',
        }),
      );
      dispatch(getTestCaseByFolderIdAction({ folderId }));
    } catch (error: unknown) {
      if (error instanceof Error && error?.message?.includes('tms_test_case_name_folder_unique')) {
        throw new SubmissionError({
          name: formatMessage(messages.duplicateTestCaseName),
        });
      } else {
        dispatch(
          showErrorNotification({
            messageId: 'testCaseUpdateFailed',
          }),
        );
      }
    } finally {
      hideSpinner();
    }
  };

  return {
    isEditTestCaseLoading,
    editTestCase,
  };
};
