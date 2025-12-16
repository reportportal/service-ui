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
import { SubmissionError } from 'redux-form';
import { isEmpty } from 'es-toolkit/compat';

import { projectKeySelector } from 'controllers/project';
import {
  getTestCaseByFolderIdAction,
  getAllTestCasesAction,
  testCasesPageSelector,
  FolderWithFullPath,
} from 'controllers/testCase';
import {
  createFoldersSuccessAction,
  updateFolderCounterAction,
} from 'controllers/testCase/actionCreators';
import { hideModalAction } from 'controllers/modal';
import { urlFolderIdSelector, TEST_CASE_LIBRARY_PAGE } from 'controllers/pages';
import { showErrorNotification, showSuccessNotification } from 'controllers/notification';
import { fetch } from 'common/utils';
import { useDebouncedSpinner } from 'common/hooks';
import { URLS } from 'common/urls';
import { getTestCaseRequestParams } from 'pages/inside/testCaseLibraryPage/utils';
import { commonMessages } from 'pages/inside/testCaseLibraryPage/commonMessages';

import { CreateTestCaseFormData, Attribute } from '../types';
import {
  buildManualScenario,
  isDuplicateTestCaseError,
  processFolder,
  buildTestCaseData,
} from './testCaseUtils';
import { NewFolderData } from '../utils/getFolderFromFormValues';

interface TestCaseResponse {
  testFolder?: {
    id: number;
  };
}

interface PatchTestCaseOptions {
  testCaseId: number;
  currentFolderId?: number;
  folder?: FolderWithFullPath | NewFolderData;
  successMessageId?: string;
  errorMessageId?: string;
  onSuccess?: (response: unknown) => void;
}

interface HandleFolderUpdateOptions {
  response: TestCaseResponse;
  newFolderDetails?: NewFolderData;
  currentFolderId?: number;
  existingFolderId?: number;
}

interface HandleNewFolderCreationOptions {
  folderId: number;
  folderName: string;
  parentFolderId?: number | null;
  currentFolderId?: number;
}

interface HandleFolderCounterUpdateOptions {
  newFolderId?: number;
  currentFolderId?: number;
}

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

  const handleFolderCounterUpdate = useCallback(
    ({ newFolderId, currentFolderId }: HandleFolderCounterUpdateOptions) => {
      const isTestCaseMoved = currentFolderId && newFolderId && currentFolderId !== newFolderId;

      if (isTestCaseMoved) {
        dispatch(updateFolderCounterAction({ folderId: currentFolderId, delta: -1 }));
        dispatch(updateFolderCounterAction({ folderId: newFolderId, delta: 1 }));
      }

      if (newFolderId) {
        refetchTestCases(newFolderId, currentFolderId);
      }
    },
    [dispatch, refetchTestCases],
  );

  const handleNewFolderCreation = useCallback(
    ({ folderId, folderName, parentFolderId, currentFolderId }: HandleNewFolderCreationOptions) => {
      dispatch(
        createFoldersSuccessAction({
          id: folderId,
          name: folderName,
          parentFolderId: parentFolderId ?? null,
          countOfTestCases: 1,
        }),
      );

      if (currentFolderId) {
        dispatch(updateFolderCounterAction({ folderId: currentFolderId, delta: -1 }));
      }

      refetchTestCases(folderId, currentFolderId);
    },
    [dispatch, refetchTestCases],
  );

  const handleFolderUpdateAfterTestCaseChange = useCallback(
    ({
      response,
      newFolderDetails,
      currentFolderId,
      existingFolderId,
    }: HandleFolderUpdateOptions) => {
      const newFolderId = response.testFolder?.id ?? existingFolderId;

      if (newFolderDetails && newFolderId) {
        handleNewFolderCreation({
          folderId: newFolderId,
          folderName: newFolderDetails.name,
          parentFolderId: newFolderDetails.parentTestFolderId,
          currentFolderId,
        });
      } else {
        handleFolderCounterUpdate({ newFolderId, currentFolderId });
      }

      return newFolderId;
    },
    [handleNewFolderCreation, handleFolderCounterUpdate],
  );

  const createNewTags = useCallback(async (attributes: Attribute[] = []): Promise<Attribute[]> => {
    const newTags = attributes.filter((attr) => attr.id < 0);
    const existingTags = attributes.filter((attr) => attr.id >= 0);

    if (isEmpty(newTags)) {
      return attributes;
    }

    const createdTags = await Promise.all(
      newTags.map(async (tag) => {
        try {
          const createdTag = await fetch<Attribute>(URLS.createTmsAttribute(), {
            method: 'POST',
            data: { key: tag.key, value: tag.value },
          });
          return createdTag;
        } catch {
          return tag;
        }
      }),
    );

    return [...existingTags, ...createdTags];
  }, []);

  const saveTestCase = useCallback(
    async (
      payload: CreateTestCaseFormData,
      options: {
        url: string;
        method: 'POST' | 'PUT';
        successMessageId: string;
        errorMessageId: string;
        currentFolderId?: number;
      },
    ) => {
      try {
        showSpinner();

        // Create new tags first
        const updatedAttributes = await createNewTags(payload.attributes);
        const updatedPayload = { ...payload, attributes: updatedAttributes };

        const manualScenario = buildManualScenario(updatedPayload);
        const { newFolderDetails, existingFolderId } = processFolder(updatedPayload.folder);

        const response = await fetch<TestCaseResponse>(options.url, {
          method: options.method,
          data: buildTestCaseData(updatedPayload, manualScenario),
        });

        dispatch(hideModalAction());
        dispatch(showSuccessNotification({ messageId: options.successMessageId }));

        handleFolderUpdateAfterTestCaseChange({
          response,
          newFolderDetails,
          currentFolderId: options.currentFolderId,
          existingFolderId,
        });
      } catch (error: unknown) {
        if (isDuplicateTestCaseError(error)) {
          throw new SubmissionError({
            name: formatMessage(commonMessages.duplicateTestCaseName),
          });
        }

        dispatch(showErrorNotification({ messageId: options.errorMessageId }));
      } finally {
        hideSpinner();
      }
    },
    [
      showSpinner,
      hideSpinner,
      createNewTags,
      dispatch,
      formatMessage,
      handleFolderUpdateAfterTestCaseChange,
    ],
  );

  const createTestCase = useCallback(
    async (payload: CreateTestCaseFormData) => {
      await saveTestCase(payload, {
        url: URLS.testCases(projectKey),
        method: 'POST',
        successMessageId: 'testCaseCreatedSuccess',
        errorMessageId: 'testCaseCreationFailed',
      });
    },
    [projectKey, saveTestCase],
  );

  const editTestCase = useCallback(
    async (payload: CreateTestCaseFormData, currentFolderId?: number) => {
      if (!testCaseId) {
        dispatch(showErrorNotification({ messageId: 'testCaseUpdateFailed' }));
        return;
      }

      await saveTestCase(payload, {
        url: URLS.testCaseDetails(projectKey, testCaseId.toString()),
        method: 'PUT',
        successMessageId: 'testCaseUpdatedSuccess',
        errorMessageId: 'testCaseUpdateFailed',
        currentFolderId,
      });
    },
    [testCaseId, projectKey, dispatch, saveTestCase],
  );

  const patchTestCase = useCallback(
    async ({
      testCaseId,
      currentFolderId,
      folder,
      successMessageId = 'testCaseUpdatedSuccess',
      errorMessageId = 'testCaseUpdateFailed',
      onSuccess,
    }: PatchTestCaseOptions) => {
      if (!folder) {
        return;
      }

      try {
        showSpinner();

        const { payload: data, newFolderDetails, existingFolderId } = processFolder(folder);

        const response = await fetch<TestCaseResponse>(
          URLS.testCaseDetails(projectKey, testCaseId.toString()),
          {
            method: 'PATCH',
            data,
          },
        );

        dispatch(hideModalAction());
        dispatch(showSuccessNotification({ messageId: successMessageId }));

        handleFolderUpdateAfterTestCaseChange({
          response,
          newFolderDetails,
          currentFolderId,
          existingFolderId,
        });

        if (onSuccess) {
          onSuccess(response);
        }
      } catch {
        dispatch(showErrorNotification({ messageId: errorMessageId }));
      } finally {
        hideSpinner();
      }
    },
    [projectKey, dispatch, showSpinner, hideSpinner, handleFolderUpdateAfterTestCaseChange],
  );

  return {
    isLoading,
    createTestCase,
    editTestCase,
    patchTestCase,
  };
};
