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

import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { useNotification } from 'common/hooks';
import { projectKeySelector } from 'controllers/project';
import { testCasesPageSelector, testCasesSelector } from 'controllers/testCase';
import { setTestCasesAction } from 'controllers/testCase/actionCreators';
import type { TestCase } from 'types/testCase';

import { useRefetchCurrentTestCases } from './useRefetchCurrentTestCases';

export type ReorderPlacement = 'before' | 'after';

export interface ReorderTestCasesParams {
  folderId: number;
  // In the order of the list; they move as one block
  testCaseIds: number[];
  anchorTestCaseId: number;
  placement: ReorderPlacement;
}

// Moves the test cases as one block, in their current order, before or after the anchor
export const moveTestCases = <T extends { id: number }>(
  items: T[],
  movedIds: number[],
  anchorId: number,
  placement: ReorderPlacement,
): T[] => {
  const moved = items.filter(({ id }) => movedIds.includes(id));
  const rest = items.filter(({ id }) => !movedIds.includes(id));
  const anchorIndex = rest.findIndex(({ id }) => id === anchorId);

  if (anchorIndex === -1 || moved.length === 0) {
    return items;
  }

  const insertIndex = placement === 'before' ? anchorIndex : anchorIndex + 1;

  return [...rest.slice(0, insertIndex), ...moved, ...rest.slice(insertIndex)];
};

export const useReorderTestCases = () => {
  const dispatch = useDispatch();
  const projectKey = useSelector(projectKeySelector);
  const testCases = useSelector(testCasesSelector);
  const page = useSelector(testCasesPageSelector);
  const refetchCurrentTestCases = useRefetchCurrentTestCases();
  const { showErrorNotification } = useNotification();

  const reorderTestCases = useCallback(
    async ({ folderId, testCaseIds, anchorTestCaseId, placement }: ReorderTestCasesParams) => {
      // Optimistic: the page keeps the same test cases, only their order changes
      dispatch(
        setTestCasesAction({
          content: moveTestCases<TestCase>(testCases, testCaseIds, anchorTestCaseId, placement),
          page,
        }),
      );

      try {
        await fetch(URLS.testFolderTestCaseOrder(projectKey, folderId), {
          method: 'PATCH',
          data: {
            testCaseIds,
            ...(placement === 'before'
              ? { beforeTestCaseId: anchorTestCaseId }
              : { afterTestCaseId: anchorTestCaseId }),
          },
        });
      } catch {
        showErrorNotification({ messageId: 'errorOccurredTryAgain' });
        refetchCurrentTestCases();
      }
    },
    [dispatch, projectKey, testCases, page, refetchCurrentTestCases, showErrorNotification],
  );

  return { reorderTestCases };
};
