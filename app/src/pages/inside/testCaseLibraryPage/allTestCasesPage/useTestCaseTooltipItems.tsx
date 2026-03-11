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

import { useIntl } from 'react-intl';

import { useUserPermissions } from 'hooks/useUserPermissions';
import { TestCaseMenuAction } from 'pages/inside/common/testCaseList/types';
import { createTestCaseMenuItems } from 'pages/inside/common/testCaseList/configUtils';
import { useDeleteTestCaseModal } from 'pages/inside/testCaseLibraryPage/deleteTestCaseModal';
import { getExcludedActionsFromPermissionMap } from 'pages/inside/common/testCaseList/utils';
import { ExtendedTestCase } from 'pages/inside/testCaseLibraryPage/types';

import { useEditTestCaseModal } from '../editSelectedTestCaseModal';
import { useMoveTestCaseModal } from '../moveTestCaseModal/useMoveTestCaseModal';
import { useDuplicateTestCaseModal } from './duplicateTestCaseModal';

interface TestCaseTooltipItemsProps {
  testCase: ExtendedTestCase;
}

export const useTestCaseTooltipItems = ({ testCase }: TestCaseTooltipItemsProps) => {
  const { formatMessage } = useIntl();
  const { canManageTestCases } = useUserPermissions();
  const { openModal: openDeleteTestCaseModal } = useDeleteTestCaseModal();
  const { openModal: openEditTestCaseModal } = useEditTestCaseModal();
  const { openModal: openMoveTestCaseModal } = useMoveTestCaseModal();
  const { openModal: openDuplicateTestCaseModal } = useDuplicateTestCaseModal();

  const permissionMap = [
    TestCaseMenuAction.DUPLICATE,
    TestCaseMenuAction.EDIT,
    TestCaseMenuAction.MOVE,
    TestCaseMenuAction.DELETE,
  ].map(action => ({
    isAllowed: canManageTestCases,
    action,
  }));

  return createTestCaseMenuItems(
    formatMessage,
    {
      [TestCaseMenuAction.DELETE]: () => openDeleteTestCaseModal({ testCase }),
      [TestCaseMenuAction.EDIT]: () => openEditTestCaseModal({ testCase }),
      [TestCaseMenuAction.MOVE]: () => openMoveTestCaseModal({ testCase }),
      [TestCaseMenuAction.DUPLICATE]: () =>
        openDuplicateTestCaseModal({
          selectedTestCaseIds: [testCase.id],
          count: 1,
          testCase,
        }),
    },
    getExcludedActionsFromPermissionMap(permissionMap),
  );
};
