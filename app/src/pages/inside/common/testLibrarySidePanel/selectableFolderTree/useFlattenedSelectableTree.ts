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

import { useMemo } from 'react';
import { isEmpty } from 'es-toolkit/compat';

import { TransformedFolder } from 'controllers/testCase';
import { TestCase } from 'types/testCase';

import { getConnectorDepths, ConnectorNode } from '../../expandedOptions/useFlattenedTree';
import type { NumberSet, FolderTestCases } from '../testLibraryPanelContext';

const buildVisibilityMap = (
  folders: TransformedFolder[],
  testPlanCountByFolderId: Map<number, number>,
  shouldHideAddedTestCases: boolean,
): Map<number, boolean> => {
  const map = new Map<number, boolean>();

  const compute = (folder: TransformedFolder): boolean => {
    const hasVisibleChildren = folder.folders.some(compute);

    if (hasVisibleChildren) {
      map.set(folder.id, true);

      return true;
    }

    if (folder.testsCount === 0) {
      map.set(folder.id, false);

      return false;
    }

    if (shouldHideAddedTestCases) {
      const testPlanCount = testPlanCountByFolderId.get(folder.id);

      if (testPlanCount != null && testPlanCount >= folder.testsCount) {
        map.set(folder.id, false);

        return false;
      }
    }

    map.set(folder.id, true);

    return true;
  };

  folders.forEach(compute);

  return map;
};

interface FolderRow extends ConnectorNode {
  type: 'folder';
  folder: TransformedFolder;
  isOpen: boolean;
  hasChildren: boolean;
}

interface TestCaseRow extends ConnectorNode {
  type: 'testCase';
  testCase: TestCase;
  folderId: number;
  isAddedToTestPlan: boolean;
}

interface LoadingRow extends ConnectorNode {
  type: 'loading';
  folderId: number;
}

interface LoadMoreRow extends ConnectorNode {
  type: 'loadMore';
  folderId: number;
}

interface ErrorRow extends ConnectorNode {
  type: 'error';
  folderId: number;
  isLoadMore: boolean;
}

export type FlatSelectableRow = FolderRow | TestCaseRow | LoadingRow | LoadMoreRow | ErrorRow;

export const getRowKey = (row: FlatSelectableRow): string => {
  switch (row.type) {
    case 'folder':
      return `folder-${row.folder.id}`;
    case 'testCase':
      return `testCase-${row.testCase.id}`;
    case 'loading':
      return `loading-${row.folderId}`;
    case 'loadMore':
      return `loadMore-${row.folderId}`;
    case 'error':
      return `error-${row.folderId}`;
  }
};

const EMPTY_TEST_CASES: TestCase[] = [];
const EMPTY_ADDED_IDS = new Set<number>();

interface FlattenOptions {
  folders: TransformedFolder[];
  expandedFolderIds: NumberSet;
  testCasesMap: Map<number, FolderTestCases>;
  shouldHideAddedTestCases: boolean;
  testPlanCountByFolderId: Map<number, number>;
  visibilityMap: Map<number, boolean>;
  depth?: number;
}

const flattenSelectableTree = ({
  folders,
  expandedFolderIds,
  testCasesMap,
  shouldHideAddedTestCases,
  testPlanCountByFolderId,
  visibilityMap,
  depth = 0,
}: FlattenOptions): FlatSelectableRow[] =>
  folders.reduce<FlatSelectableRow[]>((result, folder) => {
    if (visibilityMap.get(folder.id) === false) {
      return result;
    }

    const testPlanCount = testPlanCountByFolderId.get(folder.id);
    const isKnownAllAdded =
      testPlanCount != null && testPlanCount >= folder.testsCount && folder.testsCount > 0;

    const isOpen = expandedFolderIds.has(folder.id);
    const hasChildren =
      !isEmpty(folder.folders) ||
      (folder.testsCount > 0 && !(shouldHideAddedTestCases && isKnownAllAdded));

    result.push({
      type: 'folder',
      folder,
      depth,
      isOpen,
      hasChildren,
      connectorDepths: [],
      isLastChild: false,
    });

    if (!isOpen || !hasChildren) {
      return result;
    }

    result.push(
      ...flattenSelectableTree({
        folders: folder.folders,
        expandedFolderIds,
        testCasesMap,
        shouldHideAddedTestCases,
        testPlanCountByFolderId,
        visibilityMap,
        depth: depth + 1,
      }),
    );

    const folderData = testCasesMap.get(folder.id);
    const testCases = folderData?.testCases ?? EMPTY_TEST_CASES;
    const addedToTestPlanIds = folderData?.addedToTestPlanIds ?? EMPTY_ADDED_IDS;
    const hasNextPage = folderData?.page
      ? folderData.page.number < folderData.page.totalPages
      : false;
    const isTestCasesLoading = folderData?.isLoading ?? false;
    const hasError = folderData?.isError ?? false;

    const visibleTestCases = shouldHideAddedTestCases
      ? testCases.filter(({ id }) => !addedToTestPlanIds.has(id))
      : testCases;

    if (hasError && isEmpty(testCases)) {
      result.push({
        type: 'error',
        folderId: folder.id,
        isLoadMore: false,
        depth: depth + 1,
        connectorDepths: [],
        isLastChild: false,
      });
    } else if (isTestCasesLoading && isEmpty(testCases)) {
      result.push({
        type: 'loading',
        folderId: folder.id,
        depth: depth + 1,
        connectorDepths: [],
        isLastChild: false,
      });
    } else {
      visibleTestCases.forEach((testCase) => {
        result.push({
          type: 'testCase',
          testCase,
          folderId: folder.id,
          depth: depth + 1,
          isAddedToTestPlan: addedToTestPlanIds.has(testCase.id),
          connectorDepths: [],
          isLastChild: false,
        });
      });

      if (hasError) {
        result.push({
          type: 'error',
          folderId: folder.id,
          isLoadMore: true,
          depth: depth + 1,
          connectorDepths: [],
          isLastChild: false,
        });
      } else if (hasNextPage) {
        result.push({
          type: 'loadMore',
          folderId: folder.id,
          depth: depth + 1,
          connectorDepths: [],
          isLastChild: false,
        });
      }
    }

    return result;
  }, []);

interface UseFlattenedSelectableTreeOptions {
  folders: TransformedFolder[];
  expandedFolderIds: NumberSet;
  testCasesMap: Map<number, FolderTestCases>;
  shouldHideAddedTestCases: boolean;
  testPlanCountByFolderId: Map<number, number>;
}

export const useFlattenedSelectableTree = ({
  folders,
  expandedFolderIds,
  testCasesMap,
  shouldHideAddedTestCases,
  testPlanCountByFolderId,
}: UseFlattenedSelectableTreeOptions): FlatSelectableRow[] =>
  useMemo(() => {
    const visibilityMap = buildVisibilityMap(
      folders,
      testPlanCountByFolderId,
      shouldHideAddedTestCases,
    );

    const result = flattenSelectableTree({
      folders,
      expandedFolderIds,
      testCasesMap,
      shouldHideAddedTestCases,
      testPlanCountByFolderId,
      visibilityMap,
    });

    getConnectorDepths(result);

    return result;
  }, [folders, expandedFolderIds, testCasesMap, shouldHideAddedTestCases, testPlanCountByFolderId]);
