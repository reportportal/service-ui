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
import { useDispatch } from 'react-redux';

import {
  TEST_CASE_LIBRARY_EVENTS,
  TEST_CASE_MENU_ELEMENT_NAME,
  TEST_CASE_PLACE,
  type TestCaseMenuElementName,
} from 'analyticsEvents/testCaseLibraryPageEvents';
import { TEST_CASE_LIBRARY_PAGE } from 'controllers/pages';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { useProjectDetails } from 'hooks/useTypedSelector';
import { createTestCaseMenuItems } from 'pages/inside/common/testCaseList/configUtils';
import { TestCaseMenuAction } from 'pages/inside/common/testCaseList/types';
import { getExcludedActionsFromPermissionMap } from 'pages/inside/common/testCaseList/utils';
import { useDeleteTestCaseModal } from 'pages/inside/testCaseLibraryPage/deleteTestCaseModal';
import { useDuplicateSelectedTestCaseModal } from 'pages/inside/testCaseLibraryPage/duplicateSelectedTestCaseModal';
import { useEditTestCaseModal } from 'pages/inside/testCaseLibraryPage/editSelectedTestCaseModal';
import { useMoveTestCaseModal } from 'pages/inside/testCaseLibraryPage/moveTestCaseModal/useMoveTestCaseModal';
import { ExtendedTestCase } from 'types/testCase';

interface TestCaseTooltipItemsProps {
  testCase: ExtendedTestCase;
}

export const useTestCaseTooltipItems = ({ testCase }: TestCaseTooltipItemsProps) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const dispatch = useDispatch();
  const { organizationSlug, projectSlug } = useProjectDetails();
  const { canManageTestCases } = useUserPermissions();
  const { openModal: openDeleteTestCaseModal } = useDeleteTestCaseModal();
  const { openModal: openEditTestCaseModal } = useEditTestCaseModal();
  const { openModal: openMoveTestCaseModal } = useMoveTestCaseModal();
  const { openModal: openDuplicateSelectedTestCaseModal } = useDuplicateSelectedTestCaseModal();

  const trackPopoverMenu = (elementName: TestCaseMenuElementName) => {
    trackEvent(
      TEST_CASE_LIBRARY_EVENTS.choosePopoverMenu(
        elementName,
        TEST_CASE_PLACE.MENU_TEST_CASE,
        testCase?.id?.toString(),
      ),
    );
  };

  const permissionMap = [
    TestCaseMenuAction.DUPLICATE,
    TestCaseMenuAction.EDIT,
    TestCaseMenuAction.MOVE,
    TestCaseMenuAction.DELETE,
  ].map((action) => ({
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
      [TestCaseMenuAction.HISTORY]: () => {
        trackPopoverMenu(TEST_CASE_MENU_ELEMENT_NAME.HISTORY);
        dispatch({
          type: TEST_CASE_LIBRARY_PAGE,
          payload: {
            organizationSlug,
            projectSlug,
            testCasePageRoute: `test-cases/${testCase.id}/historyOfActions`,
          },
        });
      },
      [TestCaseMenuAction.DUPLICATE]: () => {
        trackPopoverMenu(TEST_CASE_MENU_ELEMENT_NAME.DUPLICATE);
        openDuplicateSelectedTestCaseModal({ testCase });
      },
    },
    getExcludedActionsFromPermissionMap(permissionMap),
  );
};
