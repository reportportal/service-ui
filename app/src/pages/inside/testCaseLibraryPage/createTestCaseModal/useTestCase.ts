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

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { isString } from 'es-toolkit';
import { SubmissionError } from 'redux-form';

import { projectKeySelector } from 'controllers/project';
import { fetch } from 'common/utils';
import { useDebouncedSpinner } from 'common/hooks';
import { URLS } from 'common/urls';
import { hideModalAction } from 'controllers/modal';
import { showErrorNotification, showSuccessNotification } from 'controllers/notification';
import {
  getTestCaseByFolderIdAction,
  getAllTestCasesAction,
  testCasesPageSelector,
} from 'controllers/testCase';
import {
  createFoldersSuccessAction,
  updateFolderCounterAction,
} from 'controllers/testCase/actionCreators';
import { urlFolderIdSelector, TEST_CASE_LIBRARY_PAGE } from 'controllers/pages';
import { getTestCaseRequestParams } from 'pages/inside/testCaseLibraryPage/utils';

import { CreateTestCaseFormData, ManualScenarioDto } from '../types';
import { createFolder, buildManualScenario, isDuplicateTestCaseError } from './testCaseUtils';
import { messages } from './basicInformation/messages';

const buildTestCaseData = (
  payload: CreateTestCaseFormData,
  folderId: number,
  manualScenario: ManualScenarioDto,
) => ({
  description: payload.description,
  name: payload.name,
  testFolderId: folderId,
  priority: payload.priority?.toUpperCase(),
  tags: payload.tags || [],
  manualScenario,
});

export const useTestCase = (testCaseId?: number) => {
  const { isLoading, showSpinner, hideSpinner } = useDebouncedSpinner();
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);
  const testCasesPageData = useSelector(testCasesPageSelector);
  const urlFolderId = useSelector(urlFolderIdSelector);
  const isOnTestCaseLibraryPage = useSelector(
    (state: { location: { type?: string } }) => state.location.type === TEST_CASE_LIBRARY_PAGE,
  );
  const { formatMessage } = useIntl();

  const handleFolder = useCallback(
    async (payload: CreateTestCaseFormData, currentFolderId?: number): Promise<number> => {
      if (isString(payload.folder)) {
        const folder = await createFolder(projectKey, payload.folder);

        dispatch(createFoldersSuccessAction({ ...folder, countOfTestCases: 0 }));

        return folder.id;
      }
      return payload.folder?.id || currentFolderId;
    },
    [projectKey, dispatch],
  );

  const refetchTestCases = useCallback(
    (folderId: number, prevFolderId?: number) => {
      if (!isOnTestCaseLibraryPage) {
        return;
      }

      const paginationParams = getTestCaseRequestParams(testCasesPageData);
      const isViewingTestCaseFolder = Number(urlFolderId) === folderId;
      const isTestCaseMovedAndViewingPrevFolder =
        prevFolderId && prevFolderId !== folderId && Number(urlFolderId) === prevFolderId;

      if (!urlFolderId) {
        dispatch(getAllTestCasesAction(paginationParams));
      }

      if (isViewingTestCaseFolder) {
        dispatch(
          getTestCaseByFolderIdAction({
            folderId,
            ...paginationParams,
          }),
        );
      }

      if (isTestCaseMovedAndViewingPrevFolder) {
        dispatch(
          getTestCaseByFolderIdAction({
            folderId: prevFolderId,
            ...paginationParams,
          }),
        );
      }
    },
    [isOnTestCaseLibraryPage, testCasesPageData, urlFolderId, dispatch],
  );

  const createTestCase = useCallback(
    async (payload: CreateTestCaseFormData) => {
      try {
        showSpinner();

        const folderId = await handleFolder(payload);
        const manualScenario = buildManualScenario(payload);

        const createdTestCase = await fetch(URLS.testCases(projectKey), {
          method: 'POST',
          data: buildTestCaseData(payload, folderId, manualScenario),
        });

        dispatch(hideModalAction());

        if (createdTestCase) {
          dispatch(showSuccessNotification({ messageId: 'testCaseCreatedSuccess' }));
          dispatch(updateFolderCounterAction({ folderId, delta: 1 }));
          refetchTestCases(folderId);
        }
      } catch (error: unknown) {
        if (isDuplicateTestCaseError(error)) {
          throw new SubmissionError({
            name: formatMessage(messages.duplicateTestCaseName),
          });
        }

        dispatch(showErrorNotification({ messageId: 'testCaseCreationFailed' }));
      } finally {
        hideSpinner();
      }
    },
    [projectKey, dispatch, formatMessage, showSpinner, hideSpinner, handleFolder, refetchTestCases],
  );

  const editTestCase = useCallback(
    async (payload: CreateTestCaseFormData, currentFolderId?: number) => {
      if (!testCaseId) {
        dispatch(showErrorNotification({ messageId: 'testCaseUpdateFailed' }));
        return;
      }

      try {
        showSpinner();

        const folderId = await handleFolder(payload, currentFolderId);
        const manualScenario = buildManualScenario(payload);

        await fetch(URLS.testCaseDetails(projectKey, testCaseId.toString()), {
          method: 'PUT',
          data: buildTestCaseData(payload, folderId, manualScenario),
        });

        dispatch(hideModalAction());
        dispatch(showSuccessNotification({ messageId: 'testCaseUpdatedSuccess' }));

        const isTestCaseMoved = currentFolderId && currentFolderId !== folderId;

        if (isTestCaseMoved) {
          dispatch(updateFolderCounterAction({ folderId: currentFolderId, delta: -1 }));
          dispatch(updateFolderCounterAction({ folderId, delta: 1 }));
        }

        refetchTestCases(folderId, currentFolderId);
      } catch (error: unknown) {
        if (isDuplicateTestCaseError(error)) {
          throw new SubmissionError({
            name: formatMessage(messages.duplicateTestCaseName),
          });
        }

        dispatch(showErrorNotification({ messageId: 'testCaseUpdateFailed' }));
      } finally {
        hideSpinner();
      }
    },
    [
      testCaseId,
      projectKey,
      dispatch,
      formatMessage,
      showSpinner,
      hideSpinner,
      handleFolder,
      refetchTestCases,
    ],
  );
  return {
    isLoading,
    createTestCase,
    editTestCase,
  };
};
