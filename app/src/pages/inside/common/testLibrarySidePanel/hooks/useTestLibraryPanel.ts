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
  PanelActionsContextValue,
  PanelStateContextValue,
  CheckboxSelectionState,
  FolderTestCases,
  NumberSet,
} from '../testLibraryPanelContext';
import { getAllCheckboxStates } from '../utils';

import { useBatchFolderSelection } from './useBatchFolderSelection';
import { usePrefetchTestPlanCounts } from './usePrefetchTestPlanCounts';

interface UseTestLibraryPanelProps {
  isOpen: boolean;
  shouldHideAddedTestCases: boolean;
  onAddTestCases: (testCaseIds: number[]) => Promise<boolean>;
  onClose: VoidFn;
}

interface UseTestLibraryPanelUtils {
  actionsValue: PanelActionsContextValue;
  stateValue: PanelStateContextValue;
  selectionCount: number;
  folders: ReturnType<typeof transformedFoldersSelector>;
  hasSelection: boolean;
  clearSelection: VoidFn;
  addToTestPlan: () => Promise<void>;
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
  isOpen,
  shouldHideAddedTestCases,
  onAddTestCases,
  onClose,
}: UseTestLibraryPanelProps): UseTestLibraryPanelUtils => {
  const dispatch = useDispatch();
  const [selectedTestCasesIds, setSelectedTestCasesIds] = useState<NumberSet>(new Set());
  const [selectedFolderIds, setSelectedFolderIds] = useState<NumberSet>(new Set());
  const [expandedIds, setExpandedIds] = useState<NumberSet>(new Set());
  const [testCasesMap, setTestCasesMap] = useState<Map<number, FolderTestCases>>(new Map());
  const [scrollElement, setScrollElement] = useState<HTMLElement | null>(null);
  const [batchLoadingFolderIds, setBatchLoadingFolderIds] = useState<NumberSet>(new Set());
  const [testPlanIdsByFolderId, setTestPlanIdsByFolderId] = useState<Map<number, Set<number>>>(
    new Map(),
  );

  const isOpenRef = useRef(isOpen);

  const folders = useSelector(transformedFoldersSelector);
  const activeTestPlan = useSelector(activeTestPlanSelector);
  const testPlanId = activeTestPlan?.id ?? null;

  useEffect(() => {
    dispatch(getFoldersAction());
  }, [dispatch]);

  const { fetchTestPlanTestCases, resetPrefetchCache, isInitialPrefetchDone } =
    usePrefetchTestPlanCounts({
      testPlanId,
      isOpenRef,
      setTestPlanIdsByFolderId,
    });

  useEffect(() => {
    isOpenRef.current = isOpen;

    if (!isOpen) {
      setSelectedTestCasesIds(new Set());
      setSelectedFolderIds(new Set());
      setExpandedIds(new Set());
      setTestCasesMap(new Map());
      setBatchLoadingFolderIds(new Set());
      setTestPlanIdsByFolderId(new Map());
      resetPrefetchCache();
    }
  }, [isOpen, resetPrefetchCache]);

  useEffect(() => {
    if (isOpen && testPlanId != null) {
      fetchTestPlanTestCases();
    }
  }, [isOpen, testPlanId, fetchTestPlanTestCases]);

  const updateFolderTestCases = useCallback(
    (folderId: number, newTestCases: Partial<FolderTestCases>) => {
      if (!isOpenRef.current) {
        return;
      }

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

  const toggleTestCasesSelection = useCallback((testCaseIds: number[]) => {
    setSelectedTestCasesIds((prev) =>
      testCaseIds.reduce((acc, testCaseId) => toggleSet(acc, testCaseId), prev),
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedTestCasesIds(new Set());
    setSelectedFolderIds(new Set());
  }, []);

  const addToTestPlan = useCallback(async () => {
    const selectedIds = Array.from(selectedTestCasesIds);

    if (isEmpty(selectedIds)) {
      return;
    }

    const isSuccess = await onAddTestCases(selectedIds);

    if (isSuccess) {
      clearSelection();
      onClose();
    }
  }, [selectedTestCasesIds, onAddTestCases, clearSelection, onClose]);

  const { batchSelectFolder, batchDeselectFolder } = useBatchFolderSelection({
    isOpenRef,
    testPlanId,
    testCasesMap,
    testPlanIdsByFolderId,
    isTestPlanDataComplete: isInitialPrefetchDone,
    setTestCasesMap,
    setSelectedTestCasesIds,
    setSelectedFolderIds,
    setBatchLoadingFolderIds,
  });

  const checkboxStatesMap = useMemo(() => {
    if (selectedTestCasesIds.size === 0 && selectedFolderIds.size === 0) {
      return new Map<number, CheckboxSelectionState>();
    }
    return getAllCheckboxStates(folders, selectedTestCasesIds, selectedFolderIds, testCasesMap);
  }, [folders, selectedTestCasesIds, selectedFolderIds, testCasesMap]);

  const selectionCount = selectedTestCasesIds.size;

  const hasSelection = selectionCount > 0 || selectedFolderIds.size > 0;

  const actionsValue: PanelActionsContextValue = useMemo(
    () => ({
      isOpenRef,
      setScrollElement,
      toggleTestCasesSelection,
      updateFolderTestCases,
      toggleFolder,
      batchSelectFolder,
      batchDeselectFolder,
    }),
    [
      isOpenRef,
      setScrollElement,
      toggleTestCasesSelection,
      updateFolderTestCases,
      toggleFolder,
      batchSelectFolder,
      batchDeselectFolder,
    ],
  );

  const stateValue: PanelStateContextValue = useMemo(
    () => ({
      selectedIds: selectedTestCasesIds,
      selectedFolderIds,
      testCasesMap,
      checkboxStatesMap,
      testPlanId,
      expandedFolderIds: expandedIds,
      scrollElement,
      batchLoadingFolderIds,
      shouldHideAddedTestCases,
      testPlanIdsByFolderId,
      isTestPlanDataComplete: isInitialPrefetchDone,
    }),
    [
      selectedTestCasesIds,
      selectedFolderIds,
      testCasesMap,
      checkboxStatesMap,
      testPlanId,
      expandedIds,
      scrollElement,
      batchLoadingFolderIds,
      shouldHideAddedTestCases,
      testPlanIdsByFolderId,
      isInitialPrefetchDone,
    ],
  );

  return {
    actionsValue,
    stateValue,
    folders,
    selectionCount,
    hasSelection,
    clearSelection,
    addToTestPlan,
  };
};
