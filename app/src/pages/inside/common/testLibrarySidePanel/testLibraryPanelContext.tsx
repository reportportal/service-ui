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

import { createContext, useContext, Dispatch, SetStateAction, ReactNode, RefObject } from 'react';
import { TestCase } from 'types/testCase';
import { TransformedFolder } from 'controllers/testCase';
import { Page } from 'types/common';

export type GetFolderTestCaseIds = (folder: TransformedFolder) => Promise<number[]>;
export type NumberSet = Set<number>;
export type SetState<T> = Dispatch<SetStateAction<T>>;

export enum CheckboxSelectionState {
  CHECKED = 'checked',
  UNCHECKED = 'unchecked',
  INDETERMINATE = 'indeterminate',
}

export interface FolderTestCases {
  testCases: TestCase[];
  page: Page | null;
  isLoading: boolean;
  addedToTestPlanIds?: Set<number>;
  isError?: boolean;
}

export interface PanelActionsContextValue {
  isOpenRef: RefObject<boolean>;
  setScrollElement: (element: HTMLElement | null) => void;
  toggleTestCasesSelection: (testCaseIds: number[]) => void;
  updateFolderTestCases: (
    folderId: number,
    updatedFolderTestCases: Partial<FolderTestCases>,
  ) => void;
  toggleFolder: (folder: TransformedFolder) => void;
  batchSelectFolder: (folder: TransformedFolder) => Promise<void>;
  batchDeselectFolder: (folder: TransformedFolder) => void;
  getFolderTestCaseIds: GetFolderTestCaseIds;
}

export interface PanelStateContextValue {
  selectedIds: NumberSet;
  selectedFolderIds: NumberSet;
  testCasesMap: Map<number, FolderTestCases>;
  checkboxStatesMap: Map<number, CheckboxSelectionState>;
  expandedFolderIds: NumberSet;
  batchLoadingFolderIds: NumberSet;
  testPlanId: number | null;
  scrollElement: HTMLElement | null;
  shouldHideAddedTestCases: boolean;
  testPlanCountByFolderId: Map<number, number>;
  selectedTestCases: TestCase[];
}

const PanelActionsContext = createContext<PanelActionsContextValue | null>(null);
const PanelStateContext = createContext<PanelStateContextValue | null>(null);

interface TestLibraryPanelProviderProps {
  actions: PanelActionsContextValue;
  state: PanelStateContextValue;
  children: ReactNode;
}

export const TestLibraryPanelProvider = ({
  actions,
  state,
  children,
}: TestLibraryPanelProviderProps) => (
  <PanelActionsContext.Provider value={actions}>
    <PanelStateContext.Provider value={state}>{children}</PanelStateContext.Provider>
  </PanelActionsContext.Provider>
);

export const usePanelActions = (): PanelActionsContextValue => {
  const context = useContext(PanelActionsContext);

  if (!context) {
    throw new Error('usePanelActions must be used within TestLibraryPanelProvider');
  }

  return context;
};

export const usePanelState = (): PanelStateContextValue => {
  const context = useContext(PanelStateContext);

  if (!context) {
    throw new Error('usePanelState must be used within TestLibraryPanelProvider');
  }

  return context;
};
