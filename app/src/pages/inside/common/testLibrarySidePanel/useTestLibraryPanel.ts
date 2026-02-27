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

import { useState, useEffect, useMemo, useCallback } from 'react';
import { isEmpty } from 'es-toolkit/compat';
import { useDispatch, useSelector } from 'react-redux';
import { VoidFn } from '@reportportal/ui-kit/common';

import {
  getFoldersAction,
  transformedFoldersSelector,
  TransformedFolder,
} from 'controllers/testCase';
import { activeTestPlanSelector } from 'controllers/testPlan';

import {
  TestLibraryPanelContextValue,
  FolderTestCases,
  NumberSet,
} from './testLibraryPanelContext';

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
  const [expandedIds, setExpandedIds] = useState<NumberSet>(new Set());
  const [testCasesMap, setTestCasesMap] = useState<Map<number, FolderTestCases>>(new Map());

  const folders = useSelector(transformedFoldersSelector);
  const activeTestPlan = useSelector(activeTestPlanSelector);
  const testPlanId = activeTestPlan?.id ?? null;

  useEffect(() => {
    dispatch(getFoldersAction());
  }, [dispatch]);

  const updateFolderTestCases = useCallback(
    (folderId: number, newTestCases: Partial<FolderTestCases>) => {
      setTestCasesMap((prevMap) => {
        const updatedMap = new Map(prevMap);

        const currentState = updatedMap.get(folderId) || {
          testCases: [],
          page: null,
          isLoading: false,
          addedToTestPlanIds: undefined,
        };

        updatedMap.set(folderId, {
          ...currentState,
          ...newTestCases,
        });

        return updatedMap;
      });
    },
    [],
  );

  const toggleFolder = useCallback((folder: TransformedFolder) => {
    setExpandedIds((prevState) => toggleSet(prevState, folder.id));
  }, []);

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
    const selectedIds = Array.from(selectedTestCasesIds);

    if (!isEmpty(selectedIds)) {
      onAddTestCases(selectedIds);
      clearSelection();
      onClose();
    }
  }, [selectedTestCasesIds, onAddTestCases, clearSelection, onClose]);

  const selectionCount = selectedTestCasesIds.size;

  const hasSelection = selectionCount > 0;

  const contextValue: TestLibraryPanelContextValue = useMemo(
    () => ({
      selectedIds: selectedTestCasesIds,
      selectedFolderIds,
      testCasesMap,
      testPlanId,
      expandedFolderIds: expandedIds,
      toggleTestCasesSelection,
      toggleFolderSelection,
      updateFolderTestCases,
      toggleFolder,
    }),
    [
      selectedTestCasesIds,
      selectedFolderIds,
      testCasesMap,
      testPlanId,
      expandedIds,
      toggleTestCasesSelection,
      toggleFolderSelection,
      updateFolderTestCases,
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
