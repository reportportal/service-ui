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
import { useTracking } from 'react-tracking';

import {
  TEST_CASE_LIBRARY_EVENTS,
  TEST_CASE_MENU_ELEMENT_NAME,
  type TestCaseMenuElementName,
} from 'analyticsEvents/testCaseLibraryPageEvents';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { TestCaseMenuAction } from 'pages/inside/common/testCaseList/types';
import { createTestCaseMenuItems } from 'pages/inside/common/testCaseList/configUtils';
import { useDeleteTestCaseModal } from 'pages/inside/testCaseLibraryPage/deleteTestCaseModal';
import { getExcludedActionsFromPermissionMap } from 'pages/inside/common/testCaseList/utils';
import { ExtendedTestCase } from 'types/testCase';

import { useEditTestCaseModal } from '../editSelectedTestCaseModal';
import { useMoveTestCaseModal } from '../moveTestCaseModal/useMoveTestCaseModal';
import { useDuplicateSelectedTestCaseModal } from '../duplicateSelectedTestCaseModal';

interface TestCaseTooltipItemsProps {
  testCase: ExtendedTestCase;
}

export const useTestCaseTooltipItems = ({ testCase }: TestCaseTooltipItemsProps) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const { canManageTestCases } = useUserPermissions();
  const { openModal: openDeleteTestCaseModal } = useDeleteTestCaseModal();
  const { openModal: openEditTestCaseModal } = useEditTestCaseModal();
  const { openModal: openMoveTestCaseModal } = useMoveTestCaseModal();
  const { openModal: openDuplicateSelectedTestCaseModal } = useDuplicateSelectedTestCaseModal();

  const trackPopoverMenu = (elementName: TestCaseMenuElementName) => {
    trackEvent(
      TEST_CASE_LIBRARY_EVENTS.choosePopoverMenu(
        elementName,
        testCase?.id !== undefined ? String(testCase.id) : undefined,
      ),
    );
  };

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
      [TestCaseMenuAction.DELETE]: () => {
        trackPopoverMenu(TEST_CASE_MENU_ELEMENT_NAME.DELETE);
        openDeleteTestCaseModal({ testCase });
      },
      [TestCaseMenuAction.EDIT]: () => {
        trackPopoverMenu(TEST_CASE_MENU_ELEMENT_NAME.EDIT);
        openEditTestCaseModal({ testCase });
      },
      [TestCaseMenuAction.MOVE]: () => {
        trackPopoverMenu(TEST_CASE_MENU_ELEMENT_NAME.MOVE_TO);
        openMoveTestCaseModal({ testCase });
      },
      [TestCaseMenuAction.DUPLICATE]: () => {
        trackPopoverMenu(TEST_CASE_MENU_ELEMENT_NAME.DUPLICATE);
        openDuplicateSelectedTestCaseModal({ testCase });
      },
    },
    getExcludedActionsFromPermissionMap(permissionMap),
  );
};
