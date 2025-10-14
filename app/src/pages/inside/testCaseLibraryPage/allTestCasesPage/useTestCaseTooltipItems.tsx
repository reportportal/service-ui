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
import { getExcludedActionsFromPermissionMap } from 'pages/inside/common/testCaseList/utils';
import { ExtendedTestCase } from 'pages/inside/testCaseLibraryPage/types';

interface UseTestCaseTooltipItemsProps {
  testCase?: ExtendedTestCase;
  onEdit?: (testCase: ExtendedTestCase) => void;
}

export const useTestCaseTooltipItems = ({
  testCase,
  onEdit,
}: UseTestCaseTooltipItemsProps = {}) => {
  const { formatMessage } = useIntl();

  const { canDeleteTestCase, canDuplicateTestCase, canEditTestCase, canMoveTestCase } =
    useUserPermissions();

  const permissionMap = [
    { isAllowed: canDuplicateTestCase, action: TestCaseMenuAction.DUPLICATE },
    { isAllowed: canEditTestCase, action: TestCaseMenuAction.EDIT },
    { isAllowed: canMoveTestCase, action: TestCaseMenuAction.MOVE },
    { isAllowed: canDeleteTestCase, action: TestCaseMenuAction.DELETE },
  ];

  const actions = {
    [TestCaseMenuAction.EDIT]: testCase && onEdit ? () => onEdit(testCase) : undefined,
  };

  return createTestCaseMenuItems(
    formatMessage,
    actions,
    getExcludedActionsFromPermissionMap(permissionMap),
  );
};
