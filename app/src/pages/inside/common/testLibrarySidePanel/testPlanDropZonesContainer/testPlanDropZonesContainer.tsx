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

import { useCallback, useRef } from 'react';
import { isEmpty } from 'es-toolkit/compat';

import { TestCase, ExtendedTestCase } from 'types/testCase';
import { TransformedFolder } from 'controllers/testCase';
import { TestPlanDropZones } from 'pages/inside/testPlansPage/testPlanDetailsPage/testPlanDropZones';
import { AddTestCasesToLaunchModalProps } from 'pages/inside/testPlansPage/testPlanDetailsPage/testPlanFolders/allTestCasesPage/addTestCasesToLaunchModal';

import { usePanelActions, usePanelState } from '../testLibraryPanelContext';
import { VoidFn } from '@reportportal/ui-kit/common';

interface TestPlanDropZonesContainerProps {
  testPlanId: number | null;
  onAddTestCases: (testCaseIds: number[]) => Promise<boolean>;
  openAddToLaunchModal: (props: AddTestCasesToLaunchModalProps) => void;
  onClose: VoidFn;
}

export const TestPlanDropZonesContainer = ({
  testPlanId,
  onAddTestCases,
  openAddToLaunchModal,
  onClose,
}: TestPlanDropZonesContainerProps) => {
  const { getFolderTestCaseIds } = usePanelActions();
  const { testCasesMap } = usePanelState();
  const testCasesMapRef = useRef(testCasesMap);

  testCasesMapRef.current = testCasesMap;

  const getTestCasesFromIds = useCallback((ids: number[]): TestCase[] => {
    const idSet = new Set(ids);
    const result: TestCase[] = [];

    testCasesMapRef.current.forEach(({ testCases }) => {
      testCases.forEach((tc) => {
        if (idSet.has(tc.id)) result.push(tc);
      });
    });

    return result;
  }, []);

  const addTestCases = useCallback(
    async (testCases: TestCase[]) => {
      if (isEmpty(testCases)) {
        return;
      }
      const isSuccess = await onAddTestCases(testCases.map(({ id }) => id));

      if (isSuccess) {
        onClose();
      }
    },
    [onAddTestCases, onClose],
  );

  const addTestCasesAndCreateLaunch = useCallback(
    async (testCases: TestCase[]) => {
      if (isEmpty(testCases) || testPlanId == null) {
        return;
      }

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
    },
    [onAddTestCases, onClose, openAddToLaunchModal, testPlanId],
  );

  const addFolder = useCallback(
    async (folder: TransformedFolder) => {
      const ids = await getFolderTestCaseIds(folder);

      if (isEmpty(ids)) {
        return;
      }

      const isSuccess = await onAddTestCases(ids);

      if (isSuccess) {
        onClose();
      }
    },
    [getFolderTestCaseIds, onAddTestCases, onClose],
  );

  const addFolderAndCreateLaunch = useCallback(
    async (folder: TransformedFolder) => {
      if (testPlanId == null) {
        return;
      }

      const ids = await getFolderTestCaseIds(folder);

      if (isEmpty(ids)) {
        return;
      }

      const isSuccess = await onAddTestCases(ids);

      if (isSuccess) {
        onClose();
        openAddToLaunchModal({
          selectedRowsIds: ids,
          testCases: getTestCasesFromIds(ids) as ExtendedTestCase[],
          testPlanId: String(testPlanId),
        });
      }
    },
    [getFolderTestCaseIds, getTestCasesFromIds, onAddTestCases, onClose, openAddToLaunchModal, testPlanId],
  );

  return (
    <TestPlanDropZones
      onAddTestCasesToTestPlan={(testCases) => void addTestCases(testCases)}
      onAddTestCasesAndCreateLaunch={(testCases) => void addTestCasesAndCreateLaunch(testCases)}
      onAddFolderToTestPlan={(folder) => void addFolder(folder)}
      onAddFolderAndCreateLaunch={(folder) => void addFolderAndCreateLaunch(folder)}
    />
  );
};
