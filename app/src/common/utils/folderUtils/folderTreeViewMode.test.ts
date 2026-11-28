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

import {
  FolderTreeViewMode,
  FolderTreeViewModeScope,
  getFolderIdsForViewMode,
  getFolderTreeViewMode,
  saveFolderTreeViewMode,
} from './folderTreeViewMode';

const USER_ID = 'user1';
const SETTINGS_KEY = `${USER_ID}_settings`;

const getSettings = () =>
  JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}') as Record<string, unknown>;

describe('folderTreeViewMode', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('returns Tree when nothing is stored', () => {
    expect(getFolderTreeViewMode(USER_ID, FolderTreeViewModeScope.TEST_CASE_LIBRARY)).toBe(
      FolderTreeViewMode.TREE,
    );
  });

  test('returns Tree without a user or without a scope id for scoped trees', () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ manualLaunchFolderTreeViewMode_: 'flat' }));

    expect(getFolderTreeViewMode(undefined, FolderTreeViewModeScope.TEST_CASE_LIBRARY)).toBe(
      FolderTreeViewMode.TREE,
    );
    expect(getFolderTreeViewMode(USER_ID, FolderTreeViewModeScope.MANUAL_LAUNCH, '')).toBe(
      FolderTreeViewMode.TREE,
    );
  });

  test('saves the mode in the user settings and reads it back', () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ testCaseListPageSize: 50 }));

    saveFolderTreeViewMode(
      USER_ID,
      FolderTreeViewModeScope.TEST_CASE_LIBRARY,
      undefined,
      FolderTreeViewMode.SUBFOLDERS,
    );
    saveFolderTreeViewMode(
      USER_ID,
      FolderTreeViewModeScope.MANUAL_LAUNCH,
      7,
      FolderTreeViewMode.FLAT,
    );

    expect(getSettings()).toEqual({
      testCaseListPageSize: 50,
      testCaseLibraryFolderTreeViewMode: 'subfolders',
      manualLaunchFolderTreeViewMode_7: 'flat',
    });
    expect(getFolderTreeViewMode(USER_ID, FolderTreeViewModeScope.TEST_CASE_LIBRARY)).toBe(
      FolderTreeViewMode.SUBFOLDERS,
    );
    expect(getFolderTreeViewMode(USER_ID, FolderTreeViewModeScope.MANUAL_LAUNCH, 7)).toBe(
      FolderTreeViewMode.FLAT,
    );
    expect(getFolderTreeViewMode(USER_ID, FolderTreeViewModeScope.MANUAL_LAUNCH, 8)).toBe(
      FolderTreeViewMode.TREE,
    );
  });

  test('does not save without a scope id for scoped trees', () => {
    saveFolderTreeViewMode(
      USER_ID,
      FolderTreeViewModeScope.TEST_PLAN,
      null,
      FolderTreeViewMode.FLAT,
    );

    expect(localStorage.getItem(SETTINGS_KEY)).toBeNull();
  });

  test('reads the old Flat view toggle value', () => {
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({
        testCaseLibraryFolderTreeFlatView: true,
        testPlanFolderTreeFlatView_3: false,
      }),
    );

    expect(getFolderTreeViewMode(USER_ID, FolderTreeViewModeScope.TEST_CASE_LIBRARY)).toBe(
      FolderTreeViewMode.FLAT,
    );
    expect(getFolderTreeViewMode(USER_ID, FolderTreeViewModeScope.TEST_PLAN, 3)).toBe(
      FolderTreeViewMode.TREE,
    );
  });

  test('the new value wins over the old toggle value and unknown values are ignored', () => {
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({
        testCaseLibraryFolderTreeFlatView: true,
        testCaseLibraryFolderTreeViewMode: 'tree',
        testPlanFolderTreeViewMode_3: 'unknown',
      }),
    );

    expect(getFolderTreeViewMode(USER_ID, FolderTreeViewModeScope.TEST_CASE_LIBRARY)).toBe(
      FolderTreeViewMode.TREE,
    );
    expect(getFolderTreeViewMode(USER_ID, FolderTreeViewModeScope.TEST_PLAN, 3)).toBe(
      FolderTreeViewMode.TREE,
    );
  });

  describe('getFolderIdsForViewMode', () => {
    const folders = [
      { id: 1, name: 'Root', parentFolderId: null },
      { id: 2, name: 'Child', parentFolderId: 1 },
      { id: 3, name: 'Grandchild', parentFolderId: 2 },
      { id: 4, name: 'Other root', parentFolderId: null },
    ];

    test('returns only the folder in Tree and Flat view', () => {
      expect(getFolderIdsForViewMode(1, folders, FolderTreeViewMode.TREE)).toEqual([1]);
      expect(getFolderIdsForViewMode(1, folders, FolderTreeViewMode.FLAT)).toEqual([1]);
    });

    test('returns the folder and all its subfolders in the subfolders mode', () => {
      expect(getFolderIdsForViewMode(1, folders, FolderTreeViewMode.SUBFOLDERS)).toEqual([1, 2, 3]);
      expect(getFolderIdsForViewMode(3, folders, FolderTreeViewMode.SUBFOLDERS)).toEqual([3]);
    });
  });
});
