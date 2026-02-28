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

import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { hideModalAction } from 'controllers/modal';
import { useNotification } from 'common/hooks';
import { projectKeySelector } from 'controllers/project';

import { Attribute } from '../types';
import { useRefetchCurrentTestCases } from '../hooks/useRefetchCurrentTestCases';

interface GetBatchEditTagsParams {
  testCaseIds: number[];
}
interface GetBatchEditTagsResponse {
  content: Attribute[];
}
interface PostBatchEditTagsParams {
  testCaseIds: number[];
  attributeKeysToRemove: string[];
  attributeKeysToAdd: string[];
}
interface UseBatchEditTagsParams {
  onSuccess: () => void;
}

export const useBatchEditTags = ({ onSuccess }: UseBatchEditTagsParams) => {
  const [isLoadingTags, setIsLoadingTags] = useState<boolean>(false);
  const [isLoadingTagsUpdating, setIsLoadingTagsUpdating] = useState<boolean>(false);
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);
  const refetchCurrentTestCases = useRefetchCurrentTestCases();
  const { showSuccessNotification, showErrorNotification } = useNotification();

  const getTags = useCallback(
    async ({ testCaseIds }: GetBatchEditTagsParams) => {
      setIsLoadingTags(true);

      try {
        return await fetch<GetBatchEditTagsResponse>(
          URLS.testCasesTags(projectKey),
          {
            method: 'POST',
            data: { testCaseIds },
          },
        );
      } catch {
        showErrorNotification({ messageId: 'errorOccurredTryAgain' });

        return { content: [] };
      } finally {
        setIsLoadingTags(false);
      }
    },
    [
      setIsLoadingTags,
      projectKey,
      showErrorNotification,
    ],
  );

  const updateTags = useCallback(
    async ({ testCaseIds, attributeKeysToRemove, attributeKeysToAdd }: PostBatchEditTagsParams) => {
      setIsLoadingTagsUpdating(true);

      try {
        await fetch<undefined>(
          URLS.testCasesTagsBatch(projectKey),
          {
            method: 'PATCH',
            data: { testCaseIds, attributeKeysToRemove, attributeKeysToAdd },
          },
        );

        onSuccess();
        dispatch(hideModalAction());
        refetchCurrentTestCases();
        showSuccessNotification({ messageId: 'updateTestCasesTagsSuccess' });
      } catch {
        showErrorNotification({ messageId: 'errorOccurredTryAgain' });
      } finally {
        setIsLoadingTagsUpdating(false);
      }
    },
    [
      setIsLoadingTagsUpdating,
      projectKey,
      dispatch,
      onSuccess,
      showSuccessNotification,
      showErrorNotification,
      refetchCurrentTestCases,
    ],
  );

  return {
    getTags,
    updateTags,
    isLoadingTags,
    isLoadingTagsUpdating,
  };
};
