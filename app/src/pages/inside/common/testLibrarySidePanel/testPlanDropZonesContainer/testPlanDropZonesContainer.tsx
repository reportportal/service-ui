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

import { useCallback, useRef, useState } from 'react';
import { isEmpty } from 'es-toolkit/compat';

import { useModal } from 'common/hooks';
import { TestCase } from 'types/testCase';
import { TransformedFolder } from 'controllers/testCase';
import {
  AddTestCasesToLaunchModal,
  AddTestCasesToLaunchModalProps,
  ADD_TEST_CASES_TO_LAUNCH_MODAL_KEY,
} from 'pages/inside/testPlansPage/testPlanDetailsPage/testPlanFolders/allTestCasesPage';

import { usePanelActions, usePanelState } from '../testLibraryPanelContext';
import { TestPlanDropZones } from '../testPlanDropZones';
import { VoidFn } from '@reportportal/ui-kit/common';

interface TestPlanDropZonesContainerProps {
  testPlanId: number | null;
  onAddTestCases: (testCaseIds: number[]) => Promise<boolean>;
  onClose: VoidFn;
}

export const TestPlanDropZonesContainer = ({
  testPlanId,
  onAddTestCases,
  onClose,
}: TestPlanDropZonesContainerProps) => {
  const { getFolderTestCaseIds } = usePanelActions();
  const { testCasesMap } = usePanelState();
  const [isAddToTestPlanLoading, setIsAddToTestPlanLoading] = useState(false);
  const [isAddToLaunchLoading, setIsAddToLaunchLoading] = useState(false);
  const [isAddInFlight, setIsAddInFlight] = useState(false);
  const testCasesMapRef = useRef(testCasesMap);

  testCasesMapRef.current = testCasesMap;

  const { openModal: openAddToLaunchModal } = useModal<AddTestCasesToLaunchModalProps>({
    modalKey: ADD_TEST_CASES_TO_LAUNCH_MODAL_KEY,
    renderModal: (data) => (
      <AddTestCasesToLaunchModal
        selectedRowsIds={data.selectedRowsIds}
        testCases={data.testCases}
        testPlanId={data.testPlanId}
      />
    ),
  });

  const getTestCasesFromIds = useCallback((ids: number[]): TestCase[] => {
    const idSet = new Set(ids);
    const result: TestCase[] = [];

    testCasesMapRef.current.forEach(({ testCases }) => {
      testCases.forEach((tc) => {
        if (idSet.has(tc.id)) {
          result.push(tc);
          idSet.delete(tc.id);
        }
      });
    });

    return result;
  }, []);

  const getFolderIds = useCallback(
    async (folders: TransformedFolder[]): Promise<number[]> => {
      const idsPerFolder = await Promise.all(folders.map((folder) => getFolderTestCaseIds(folder)));

      return Array.from(new Set(idsPerFolder.flat()));
    },
    [getFolderTestCaseIds],
  );

  const addTestCases = useCallback(
    async (testCases: TestCase[]) => {
      if (isEmpty(testCases) || isAddInFlight) {
        return;
      }

      setIsAddInFlight(true);
      setIsAddToTestPlanLoading(true);

      try {
        const isSuccess = await onAddTestCases(testCases.map(({ id }) => id));

        if (isSuccess) {
          onClose();
        }
      } finally {
        setIsAddToTestPlanLoading(false);
        setIsAddInFlight(false);
      }
    },
    [isAddInFlight, onAddTestCases, onClose],
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
        const isSuccess = await onAddTestCases(ids);

        if (isSuccess) {
          onClose();
          openAddToLaunchModal({
            selectedRowsIds: ids,
            testCases,
            testPlanId: String(testPlanId),
          });
        }
      } finally {
        setIsAddToLaunchLoading(false);
        setIsAddInFlight(false);
      }
    },
    [isAddInFlight, onAddTestCases, onClose, openAddToLaunchModal, testPlanId],
  );

  const addFolder = useCallback(
    async (folders: TransformedFolder[]) => {
      if (isAddInFlight) {
        return;
      }

      setIsAddInFlight(true);
      setIsAddToTestPlanLoading(true);

      try {
        const ids = await getFolderIds(folders);

        if (isEmpty(ids)) {
          return;
        }

        const isSuccess = await onAddTestCases(ids);

        if (isSuccess) {
          onClose();
        }
      } finally {
        setIsAddToTestPlanLoading(false);
        setIsAddInFlight(false);
      }
    },
    [getFolderIds, isAddInFlight, onAddTestCases, onClose],
  );

  const addFolderAndCreateLaunch = useCallback(
    async (folders: TransformedFolder[]) => {
      if (testPlanId == null || isAddInFlight) {
        return;
      }

      setIsAddInFlight(true);
      setIsAddToLaunchLoading(true);

      try {
        const ids = await getFolderIds(folders);

        if (isEmpty(ids)) {
          return;
        }

        const isSuccess = await onAddTestCases(ids);

        if (isSuccess) {
          onClose();
          openAddToLaunchModal({
            selectedRowsIds: ids,
            testCases: getTestCasesFromIds(ids),
            testPlanId: String(testPlanId),
          });
        }
      } finally {
        setIsAddToLaunchLoading(false);
        setIsAddInFlight(false);
      }
    },
    [
      getFolderIds,
      getTestCasesFromIds,
      isAddInFlight,
      onAddTestCases,
      onClose,
      openAddToLaunchModal,
      testPlanId,
    ],
  );

  return (
    <TestPlanDropZones
      isAddToTestPlanLoading={isAddToTestPlanLoading}
      isAddToLaunchLoading={isAddToLaunchLoading}
      onAddTestCasesToTestPlan={(testCases) => void addTestCases(testCases)}
      onAddTestCasesAndCreateLaunch={(testCases) => void addTestCasesAndCreateLaunch(testCases)}
      onAddFolderToTestPlan={(folder) => void addFolder(folder)}
      onAddFolderAndCreateLaunch={(folder) => void addFolderAndCreateLaunch(folder)}
    />
  );
};
