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

export const useTestPlanTooltipItems = () => {
  const { formatMessage } = useIntl();

  const { canDeleteTestCase, canDuplicateTestCase, canEditTestCase } = useUserPermissions();

  const permissionMap = [
    { isAllowed: canEditTestCase, action: TestCaseMenuAction.EDIT },
    { isAllowed: canDuplicateTestCase, action: TestCaseMenuAction.DUPLICATE },
    { isAllowed: canDeleteTestCase, action: TestCaseMenuAction.DELETE },
    { isAllowed: false, action: TestCaseMenuAction.HISTORY },
    { isAllowed: false, action: TestCaseMenuAction.MOVE },
  ];

  return createTestCaseMenuItems(
    formatMessage,
    null,
    getExcludedActionsFromPermissionMap(permissionMap),
  );
};
