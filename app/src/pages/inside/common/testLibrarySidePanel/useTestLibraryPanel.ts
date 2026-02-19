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

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { isEmpty, isNumber } from 'es-toolkit/compat';
import { useDispatch, useSelector } from 'react-redux';
import { VoidFn } from '@reportportal/ui-kit/common';

import {
  areFoldersFetchedSelector,
  getFoldersAction,
  transformedFoldersSelector,
  testCasesSelector,
  TransformedFolder,
} from 'controllers/testCase';
import { TestCase } from 'pages/inside/testCaseLibraryPage/types';

import { TestLibraryPanelContextValue } from './testLibraryPanelContext';
import { useTestPlanSelector } from 'hooks/useTypedSelector';
import { testPlanTestCasesSelector } from 'controllers/testPlan';

interface UseTestLibraryPanelProps {
  onAddTestCases: (testCaseIds: number[]) => void;
  onClose: VoidFn;
}

interface UseTestLibraryPanelUtils {
  contextValue: TestLibraryPanelContextValue;
  selectionCount: number;
  folders: ReturnType<typeof transformedFoldersSelector>;
  hasSelection: boolean;
  clearSelection: VoidFn;
  addToTestPlan: VoidFn;
}

type NumberSet = Set<number>;

const toggleSet = (set: NumberSet, value: number): NumberSet => {
  const updatedSet = new Set(set);

  if (updatedSet.has(value)) {
    updatedSet.delete(value);
  } else {
    updatedSet.add(value);
  }

  return updatedSet;
};

export const useTestLibraryPanel = ({
  onAddTestCases,
  onClose,
}: UseTestLibraryPanelProps): UseTestLibraryPanelUtils => {
  const dispatch = useDispatch();
  const [selectedTestCasesIds, setSelectedTestCasesIds] = useState<NumberSet>(new Set());
  const [selectedFolderIds, setSelectedFolderIds] = useState<NumberSet>(new Set());
  const [fetchedFolderIds, setFetchedFolderIds] = useState<NumberSet>(new Set());
  const [expandedIds, setExpandedIds] = useState<NumberSet>(new Set());
  const [testCasesMap, setTestCasesMap] = useState<Map<number, TestCase[]>>(new Map());

  const lastExpandedIdRef = useRef<number>();
  const areFoldersFetched = useSelector(areFoldersFetchedSelector);
  const testCases = useSelector(testCasesSelector);
  const folders = useSelector(transformedFoldersSelector);
  const testPlanTestCases = useTestPlanSelector(testPlanTestCasesSelector);

  useEffect(() => {
    if (!areFoldersFetched) {
      dispatch(getFoldersAction());
    }
  }, [areFoldersFetched, dispatch]);

  useEffect(() => {
    if (
      isNumber(lastExpandedIdRef.current) &&
      !testCasesMap.has(lastExpandedIdRef.current) &&
      !isEmpty(testCases)
    ) {
      const folderId = lastExpandedIdRef.current;

      setTestCasesMap((prevMap) => {
        const updatedMap = new Map(prevMap);

        updatedMap.set(folderId, testCases);

        return updatedMap;
      });

      lastExpandedIdRef.current = undefined;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testCases]);

  const testPlanTestCaseIds = useMemo(
    () => new Set(testPlanTestCases.map(({ id }) => id)),
    [testPlanTestCases],
  );

  const handleFolderFetched = useCallback((folderId: number) => {
    setFetchedFolderIds((prev) => new Set(prev).add(folderId));
  }, []);

  const toggleFolder = useCallback(
    (folder: TransformedFolder) => {
      if (!expandedIds.has(folder.id)) {
        lastExpandedIdRef.current = folder.id;
      }

      setExpandedIds((prevState) => toggleSet(prevState, folder.id));
    },
    [expandedIds],
  );

  const toggleFolderSelection = useCallback((folderId: number) => {
    setSelectedFolderIds((prevState) => toggleSet(prevState, folderId));
  }, []);

  const toggleTestCasesSelection = useCallback((testCaseIds: number[]) => {
    setSelectedTestCasesIds((prev) => testCaseIds.reduce((acc, id) => toggleSet(acc, id), prev));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedTestCasesIds(new Set());
    setSelectedFolderIds(new Set());
  }, []);

  const addToTestPlan = useCallback(() => {
    const selectedIds = Array.from(selectedTestCasesIds).filter(
      (id) => !testPlanTestCaseIds.has(id),
    );

    if (!isEmpty(selectedIds)) {
      onAddTestCases(selectedIds);
      clearSelection();
      onClose();
    }
  }, [selectedTestCasesIds, testPlanTestCaseIds, onAddTestCases, clearSelection, onClose]);

  const selectionCount = useMemo(
    () => Array.from(selectedTestCasesIds).filter((id) => !testPlanTestCaseIds.has(id)).length,
    [selectedTestCasesIds, testPlanTestCaseIds],
  );

  const hasSelection = selectionCount > 0;

  const contextValue: TestLibraryPanelContextValue = useMemo(
    () => ({
      selectedIds: selectedTestCasesIds,
      selectedFolderIds,
      testPlanTestCaseIds,
      testCasesMap,
      fetchedFolderIds,
      expandedFolderIds: expandedIds,
      toggleTestCasesSelection,
      toggleFolderSelection,
      onFolderFetched: handleFolderFetched,
      toggleFolder,
    }),
    [
      selectedTestCasesIds,
      selectedFolderIds,
      testPlanTestCaseIds,
      testCasesMap,
      fetchedFolderIds,
      expandedIds,
      toggleTestCasesSelection,
      toggleFolderSelection,
      handleFolderFetched,
      toggleFolder,
    ],
  );

  return {
    contextValue,
    folders,
    selectionCount,
    hasSelection,
    clearSelection,
    addToTestPlan,
  };
};
