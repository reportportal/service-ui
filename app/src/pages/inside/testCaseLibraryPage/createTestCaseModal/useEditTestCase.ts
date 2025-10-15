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
import { useIntl } from 'react-intl';

import { projectKeySelector } from 'controllers/project';
import { fetch } from 'common/utils';
import { useDebouncedSpinner } from 'common/hooks';
import { URLS } from 'common/urls';
import { hideModalAction } from 'controllers/modal';
import { showErrorNotification, showSuccessNotification } from 'controllers/notification';
import { getTestCaseByFolderIdAction } from 'controllers/testCase';
import { createFoldersSuccessAction } from 'controllers/testCase/actionCreators';

import { messages } from './basicInformation/messages';
import { CreateTestCaseFormData } from '../types';
import { createFolder, buildManualScenario, handleTestCaseError } from './testCaseUtils';
import { isString } from 'es-toolkit';

export const useEditTestCase = (testCaseId?: number) => {
  const { isLoading: isEditTestCaseLoading, showSpinner, hideSpinner } = useDebouncedSpinner();
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);
  const { formatMessage } = useIntl();

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

      let folderId: number;

      if (isString(payload.folder)) {
        const folder = await createFolder(projectKey, payload.folder);
        dispatch(createFoldersSuccessAction({ ...folder, countOfTestCases: 0 }));
        folderId = folder.id;
      } else {
        folderId = payload.folder?.id || currentFolderId || 0;
      }

      const manualScenario = buildManualScenario(payload);

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
      try {
        handleTestCaseError(error, formatMessage, messages.duplicateTestCaseName);
      } catch {
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
