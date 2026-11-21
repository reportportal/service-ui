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
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useTracking } from 'react-tracking';
import { isEmpty } from 'es-toolkit/compat';

import {
  DND_DROP_TARGET,
  DND_ITEM_COUNT_TYPE,
  DndDropTarget,
  TEST_PLANS_PAGE_EVENTS,
  ACTION_SOURCE,
  PLACE_TEST_CASE_LIBRARY_SIDE_PANEL,
} from 'analyticsEvents/testPlansPageEvents';
import { useModal, useNotification } from 'common/hooks';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { showModalAction } from 'controllers/modal';
import { ADD_BY_FOLDER_LIMIT } from 'common/constants/tms';
import { BULK_ADD_TO_LAUNCH_MIN_SELECTION } from 'pages/inside/common/constants';
import { TestCase } from 'types/testCase';
import { TransformedFolder } from 'controllers/testCase';
import type { BatchAddTestCasesRQ } from 'controllers/testPlan/types';
import {
  AddTestCasesToLaunchModal,
  AddTestCasesToLaunchModalProps,
  ADD_TEST_CASES_TO_LAUNCH_MODAL_KEY,
} from 'pages/inside/testPlansPage/testPlanDetailsPage/testPlanFolders/allTestCasesPage';

import { TestPlanDropZones } from '../testPlanDropZones';
import { messages } from '../messages';
import { countFolderTestCases, LARGE_FOLDER_ADD_THRESHOLD } from '../utils/countFolderTestCases';
import { VoidFn } from '@reportportal/ui-kit/common';

interface TestPlanDropZonesContainerProps {
  testPlanId: number | null;
  onAddTestCases: (request: BatchAddTestCasesRQ) => Promise<boolean>;
  onClose: VoidFn;
}

export const TestPlanDropZonesContainer = ({
  testPlanId,
  onAddTestCases,
  onClose,
}: TestPlanDropZonesContainerProps) => {
  const { trackEvent } = useTracking();
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { showErrorNotification } = useNotification();
  const [isAddToTestPlanLoading, setIsAddToTestPlanLoading] = useState(false);
  const [isAddToLaunchLoading, setIsAddToLaunchLoading] = useState(false);
  const [isAddInFlight, setIsAddInFlight] = useState(false);

  const trackDropSuccess = useCallback(
    (switcher: DndDropTarget, count: number) => {
      if (count <= 0) {
        return;
      }
      trackEvent(
        TEST_PLANS_PAGE_EVENTS.dragDropTestCaseToPlan({
          switcher,
          type: count === 1 ? DND_ITEM_COUNT_TYPE.SINGLE : DND_ITEM_COUNT_TYPE.MULTI,
          number: count,
        }),
      );
    },
    [trackEvent],
  );

  const { openModal: openAddToLaunchModal } = useModal<AddTestCasesToLaunchModalProps>({
    modalKey: ADD_TEST_CASES_TO_LAUNCH_MODAL_KEY,
    renderModal: (data) => (
      <AddTestCasesToLaunchModal
        selectedRowsIds={data.selectedRowsIds}
        testCases={data.testCases}
        folderIds={data.folderIds}
        itemCount={data.itemCount}
        testPlanId={data.testPlanId}
        source={data.source}
        place={data.place}
      />
    ),
  });

  const addTestCases = useCallback(
    async (testCases: TestCase[]) => {
      if (isEmpty(testCases) || isAddInFlight) {
        return;
      }

      setIsAddInFlight(true);
      setIsAddToTestPlanLoading(true);

      try {
        const ids = testCases.map(({ id }) => id);
        const isSuccess = await onAddTestCases({ testCaseIds: ids });

        if (isSuccess) {
          trackDropSuccess(DND_DROP_TARGET.PLAN_LIST, ids.length);
          onClose();
        }
      } finally {
        setIsAddToTestPlanLoading(false);
        setIsAddInFlight(false);
      }
    },
    [isAddInFlight, onAddTestCases, onClose, trackDropSuccess],
  );

  const addTestCasesAndCreateLaunch = useCallback(
    async (testCases: TestCase[]) => {
      if (isEmpty(testCases) || testPlanId == null || isAddInFlight) {
        return;
      }

      setIsAddInFlight(true);
      setIsAddToLaunchLoading(true);

      try {
        const ids = testCases.map(({ id }) => id);
        const isSuccess = await onAddTestCases({ testCaseIds: ids });

        if (isSuccess) {
          trackDropSuccess(DND_DROP_TARGET.ADD_AND_CREATE_LAUNCH, ids.length);
          onClose();
          openAddToLaunchModal({
            selectedRowsIds: ids,
            testCases,
            testPlanId: String(testPlanId),
            source:
              ids.length >= BULK_ADD_TO_LAUNCH_MIN_SELECTION
                ? ACTION_SOURCE.BULK
                : ACTION_SOURCE.SINGLE,
            place: PLACE_TEST_CASE_LIBRARY_SIDE_PANEL,
          });
        }
      } finally {
        setIsAddToLaunchLoading(false);
        setIsAddInFlight(false);
      }
    },
    [isAddInFlight, onAddTestCases, onClose, openAddToLaunchModal, testPlanId, trackDropSuccess],
  );

  // Dropped folders are sent as folder ids: the server adds their whole subtrees (test cases already
  // in the plan count as added), so no test case is downloaded here.
  const addFolder = useCallback(
    async (folders: TransformedFolder[]) => {
      const count = countFolderTestCases(folders);

      if (count === 0 || isAddInFlight) {
        return;
      }

      setIsAddInFlight(true);
      setIsAddToTestPlanLoading(true);

      try {
        const isSuccess = await onAddTestCases({ folderIds: folders.map(({ id }) => id) });

        if (isSuccess) {
          trackDropSuccess(DND_DROP_TARGET.PLAN_LIST, count);
          onClose();
        }
      } finally {
        setIsAddToTestPlanLoading(false);
        setIsAddInFlight(false);
      }
    },
    [isAddInFlight, onAddTestCases, onClose, trackDropSuccess],
  );

  const addFolderAndCreateLaunch = useCallback(
    async (folders: TransformedFolder[]) => {
      const count = countFolderTestCases(folders);

      if (count === 0 || testPlanId == null || isAddInFlight) {
        return;
      }

      setIsAddInFlight(true);
      setIsAddToLaunchLoading(true);

      try {
        const folderIds = folders.map(({ id }) => id);
        const isSuccess = await onAddTestCases({ folderIds });

        if (isSuccess) {
          trackDropSuccess(DND_DROP_TARGET.ADD_AND_CREATE_LAUNCH, count);
          onClose();
          openAddToLaunchModal({
            selectedRowsIds: [],
            testCases: [],
            folderIds,
            itemCount: count,
            testPlanId: String(testPlanId),
            source:
              count >= BULK_ADD_TO_LAUNCH_MIN_SELECTION ? ACTION_SOURCE.BULK : ACTION_SOURCE.SINGLE,
            place: PLACE_TEST_CASE_LIBRARY_SIDE_PANEL,
          });
        }
      } finally {
        setIsAddToLaunchLoading(false);
        setIsAddInFlight(false);
      }
    },
    [isAddInFlight, onAddTestCases, onClose, openAddToLaunchModal, testPlanId, trackDropSuccess],
  );

  // Above the API limit nothing is sent; above the threshold the user confirms the large add first.
  const confirmLargeFolderAdd = (folders: TransformedFolder[], proceed: () => void) => {
    const count = countFolderTestCases(folders);

    if (count > ADD_BY_FOLDER_LIMIT) {
      showErrorNotification({
        messageId: 'addByFolderLimitExceeded',
        values: { count, limit: ADD_BY_FOLDER_LIMIT },
      });

      return;
    }

    if (count <= LARGE_FOLDER_ADD_THRESHOLD) {
      proceed();

      return;
    }

    dispatch(
      showModalAction({
        id: 'confirmationModal',
        data: {
          title: formatMessage(messages.largeFolderAddTitle, { count }),
          message: formatMessage(messages.largeFolderAddMessage, { count }),
          confirmText: formatMessage(COMMON_LOCALE_KEYS.ADD),
          cancelText: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
          onConfirm: proceed,
        },
      }),
    );
  };

  return (
    <TestPlanDropZones
      isAddToTestPlanLoading={isAddToTestPlanLoading}
      isAddToLaunchLoading={isAddToLaunchLoading}
      onAddTestCasesToTestPlan={(testCases) => {
        addTestCases(testCases);
      }}
      onAddTestCasesAndCreateLaunch={(testCases) => {
        addTestCasesAndCreateLaunch(testCases);
      }}
      onAddFolderToTestPlan={(folder) => {
        confirmLargeFolderAdd(folder, () => {
          addFolder(folder);
        });
      }}
      onAddFolderAndCreateLaunch={(folder) => {
        confirmLargeFolderAdd(folder, () => {
          addFolderAndCreateLaunch(folder);
        });
      }}
    />
  );
};
