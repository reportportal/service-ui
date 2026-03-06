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

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { isEmpty } from 'es-toolkit/compat';

import { projectKeySelector } from 'controllers/project';
import { FolderWithFullPath, GET_TEST_CASE_DETAILS } from 'controllers/testCase';
import { hideModalAction } from 'controllers/modal';
import { fetch } from 'common/utils';
import { useDebouncedSpinner, useNotification } from 'common/hooks';
import { NotificationMessageKey } from 'common/hooks/useNotification';
import { URLS } from 'common/urls';

import { Attribute, CreateTestCaseFormData } from '../types';
import {
  buildManualScenario,
  buildTestCaseData,
  processFolder,
} from '../createTestCaseModal/testCaseUtils';
import { NewFolderData } from '../utils/getFolderFromFormValues';
import { useFolderActions } from './useFolderActions';
import { useRefetchCurrentTestCases } from './useRefetchCurrentTestCases';

interface TestCaseResponse {
  testFolder?: {
    id: number;
  };
}

interface UpdateTestCaseOptions {
  testCaseId: number;
  testCasesSourceFolderId?: number;
  destinationFolder?: FolderWithFullPath | NewFolderData;
  successMessageId?: NotificationMessageKey;
  errorMessageId?: NotificationMessageKey;
  payload?: UpdateTestCasePayload;
  onSuccess?: (response: unknown) => void;
}

export interface UpdateTestCasePayload {
  name?: string;
  priority?: string;
  testFolderId?: number;
}

export const useTestCaseMutations = (testCaseId?: number) => {
  const { isLoading, showSpinner, hideSpinner } = useDebouncedSpinner();
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);
  const { processFolderDestinationAndComplete } = useFolderActions();
  const refetchCurrentTestCases = useRefetchCurrentTestCases();
  const { showSuccessNotification, showErrorNotification } = useNotification();

  const completeFolderDestination = useCallback(
    ({
      newFolderDetails,
      existingFolderId,
      responseFolderId,
      sourceFolderId,
    }: {
      newFolderDetails?: NewFolderData;
      existingFolderId?: number;
      responseFolderId?: number;
      sourceFolderId?: number;
    }) => {
      const destination =
        newFolderDetails ||
        (existingFolderId ? ({ id: existingFolderId } as FolderWithFullPath) : null);

      if (destination) {
        processFolderDestinationAndComplete({
          destination,
          responseFolderId,
          sourceFolderId,
          testCaseCount: 1,
        });
      }
    },
    [processFolderDestinationAndComplete],
  );

  const createNewTags = useCallback(async (attributes: Attribute[] = []) => {
    const newTags = attributes.filter(({ id }) => id < 0);
    const existingTags = attributes.filter(({ id }) => id >= 0);

    if (isEmpty(newTags)) {
      return attributes;
    }

    const createdTags = await Promise.all(
      newTags.map(async (tag) => {
        try {
          return fetch<Attribute>(URLS.createTmsAttribute(), {
            method: 'POST',
            data: { key: tag.key, value: tag.value },
          });
        } catch {
          return null;
        }
      }),
    );

    const successfullyCreatedTags = createdTags.filter((tag): tag is Attribute => tag !== null);

    return [...existingTags, ...successfullyCreatedTags];
  }, []);

  const handleTestCaseCreation = useCallback(
    async (
      payload: CreateTestCaseFormData,
      options: {
        url: string;
        method: 'POST' | 'PUT';
        successMessageId: NotificationMessageKey;
        errorMessageId: NotificationMessageKey;
        currentFolderId?: number;
        isDetailsPage?: boolean;
      },
    ) => {
      try {
        showSpinner();

        const updatedAttributes = await createNewTags(payload.attributes);

        const manualScenario = buildManualScenario(payload);
        const { newFolderDetails, existingFolderId } = processFolder(payload.folder);

        const response = await fetch<TestCaseResponse>(options.url, {
          method: options.method,
          data: buildTestCaseData(payload, manualScenario, updatedAttributes),
        });

        if (options.isDetailsPage && testCaseId) {
          dispatch({ type: GET_TEST_CASE_DETAILS, payload: { testCaseId } });
        }

        dispatch(hideModalAction());
        showSuccessNotification({ messageId: options.successMessageId });

        if (!options.isDetailsPage) {
          completeFolderDestination({
            newFolderDetails,
            existingFolderId,
            responseFolderId: response?.testFolder?.id,
          });
        }
      } catch {
        showErrorNotification({ messageId: options.errorMessageId });
      } finally {
        hideSpinner();
      }
    },
    [
      showSpinner,
      hideSpinner,
      createNewTags,
      dispatch,
      completeFolderDestination,
      showSuccessNotification,
      showErrorNotification,
      testCaseId,
    ],
  );

  const createTestCase = useCallback(
    (payload: CreateTestCaseFormData) =>
      handleTestCaseCreation(payload, {
        url: URLS.testCases(projectKey),
        method: 'POST',
        successMessageId: 'testCaseCreatedSuccess',
        errorMessageId: 'testCaseCreationFailed',
      }),
    [projectKey, handleTestCaseCreation],
  );

  const editTestCase = useCallback(
    async (payload: CreateTestCaseFormData, currentFolderId?: number, isDetailsPage?: boolean) => {
      if (!testCaseId) {
        showErrorNotification({ messageId: 'testCaseUpdateFailed' });

        return;
      }

      await handleTestCaseCreation(payload, {
        url: URLS.testCaseDetails(projectKey, testCaseId.toString()),
        method: 'PUT',
        successMessageId: 'testCaseUpdatedSuccess',
        errorMessageId: 'testCaseUpdateFailed',
        currentFolderId,
        isDetailsPage,
      });
    },
    [testCaseId, projectKey, handleTestCaseCreation, showErrorNotification],
  );

  const patchTestCase = useCallback(
    async ({
      testCaseId: targetTestCaseId,
      testCasesSourceFolderId,
      destinationFolder,
      payload = {},
      successMessageId = 'testCaseUpdatedSuccess',
      errorMessageId = 'testCaseUpdateFailed',
      onSuccess,
    }: UpdateTestCaseOptions) => {
      const resolvedTestCaseId = targetTestCaseId ?? testCaseId;

      if (!resolvedTestCaseId) {
        showErrorNotification({ messageId: errorMessageId });

        return;
      }

      try {
        showSpinner();

        const folderData = destinationFolder ? processFolder(destinationFolder) : undefined;
        const data = {
          ...payload,
          ...folderData?.payload,
        };
        const newFolderDetails = folderData?.newFolderDetails;
        const existingFolderId = folderData?.existingFolderId;

        const response = await fetch<TestCaseResponse>(
          URLS.testCaseDetails(projectKey, resolvedTestCaseId.toString()),
          {
            method: 'PATCH',
            data,
          },
        );

        if (payload && !destinationFolder) {
          dispatch({ type: GET_TEST_CASE_DETAILS, payload: { testCaseId: resolvedTestCaseId } });
          refetchCurrentTestCases();
        }

        dispatch(hideModalAction());
        showSuccessNotification({ messageId: successMessageId });

        if (destinationFolder) {
          completeFolderDestination({
            newFolderDetails,
            existingFolderId,
            responseFolderId: response?.testFolder?.id,
            sourceFolderId: testCasesSourceFolderId,
          });
        }

        onSuccess?.(response);
      } catch (error) {
        showErrorNotification({
          messageId: errorMessageId,
          message: (error as Error).message,
        });
      } finally {
        hideSpinner();
      }
    },
    [
      testCaseId,
      projectKey,
      dispatch,
      showSpinner,
      hideSpinner,
      completeFolderDestination,
      refetchCurrentTestCases,
      showSuccessNotification,
      showErrorNotification,
    ],
  );

  return {
    isLoading,
    createTestCase,
    editTestCase,
    patchTestCase,
  };
};
