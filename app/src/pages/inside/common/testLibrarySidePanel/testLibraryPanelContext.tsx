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

import { createContext, useContext, ReactNode } from 'react';
import { TestCase } from 'pages/inside/testCaseLibraryPage/types';
import { TransformedFolder } from 'controllers/testCase';

export type NumberSet = Set<number>;

export interface TestLibraryPanelContextValue {
  selectedIds: NumberSet;
  selectedFolderIds: NumberSet;
  testPlanTestCaseIds: NumberSet;
  testCasesMap: Map<number, TestCase[]>;
  fetchedFolderIds: NumberSet;
  expandedFolderIds: NumberSet;
  toggleTestCasesSelection: (testCaseIds: number[]) => void;
  toggleFolderSelection: (folderId: number) => void;
  onFolderFetched: (folderId: number) => void;
  toggleFolder: (folder: TransformedFolder) => void;
}

const TestLibraryPanelContext = createContext<TestLibraryPanelContextValue | null>(null);

interface TestLibraryPanelProviderProps {
  value: TestLibraryPanelContextValue;
  children: ReactNode;
}

export const TestLibraryPanelProvider = ({ value, children }: TestLibraryPanelProviderProps) => (
  <TestLibraryPanelContext.Provider value={value}>{children}</TestLibraryPanelContext.Provider>
);

export const useTestLibraryPanelContext = (): TestLibraryPanelContextValue => {
  const context = useContext(TestLibraryPanelContext);

  if (!context) {
    throw new Error('useTestLibraryPanelContext must be used within TestLibraryPanelProvider');
  }

  return context;
};
