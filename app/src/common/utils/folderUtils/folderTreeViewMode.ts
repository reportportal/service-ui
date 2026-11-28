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

import { getStorageItem, updateStorageItem } from '../storageUtils';
import { getAllSubfolderIds, type BaseFolder } from './transformFolders';

export enum FolderTreeViewMode {
  TREE = 'tree',
  FLAT = 'flat',
  SUBFOLDERS = 'subfolders',
}

export enum FolderTreeViewModeScope {
  TEST_CASE_LIBRARY = 'testCaseLibrary',
  TEST_PLAN = 'testPlan',
  MANUAL_LAUNCH = 'manualLaunch',
}

type ScopeId = string | number | null | undefined;
type UserId = string | number | null | undefined;

const VIEW_MODES = new Set<string>(Object.values(FolderTreeViewMode));

const hasScopeId = (scopeId: ScopeId) =>
  scopeId !== null && scopeId !== undefined && scopeId !== '';

const getFieldKeys = (scope: FolderTreeViewModeScope, scopeId: ScopeId) => {
  if (scope === FolderTreeViewModeScope.TEST_CASE_LIBRARY) {
    return {
      viewModeKey: `${scope}FolderTreeViewMode`,
      legacyFlatViewKey: `${scope}FolderTreeFlatView`,
    };
  }

  if (!hasScopeId(scopeId)) {
    return null;
  }

  return {
    viewModeKey: `${scope}FolderTreeViewMode_${String(scopeId)}`,
    legacyFlatViewKey: `${scope}FolderTreeFlatView_${String(scopeId)}`,
  };
};

const getSettingsStorageKey = (userId: UserId) => `${String(userId)}_settings`;

export const getFolderTreeViewMode = (
  userId: UserId,
  scope: FolderTreeViewModeScope,
  scopeId?: ScopeId,
): FolderTreeViewMode => {
  const fieldKeys = getFieldKeys(scope, scopeId);

  if (!userId || !fieldKeys) {
    return FolderTreeViewMode.TREE;
  }

  const settings = getStorageItem(getSettingsStorageKey(userId)) as
    | Record<string, unknown>
    | null
    | undefined;
  const viewMode = settings?.[fieldKeys.viewModeKey];

  if (typeof viewMode === 'string' && VIEW_MODES.has(viewMode)) {
    return viewMode as FolderTreeViewMode;
  }

  // Before the view mode switch there was only a "Flat view" toggle stored as a boolean.
  return settings?.[fieldKeys.legacyFlatViewKey] === true
    ? FolderTreeViewMode.FLAT
    : FolderTreeViewMode.TREE;
};

export const saveFolderTreeViewMode = (
  userId: UserId,
  scope: FolderTreeViewModeScope,
  scopeId: ScopeId,
  viewMode: FolderTreeViewMode,
) => {
  const fieldKeys = getFieldKeys(scope, scopeId);

  if (!userId || !fieldKeys) {
    return;
  }

  updateStorageItem(getSettingsStorageKey(userId), { [fieldKeys.viewModeKey]: viewMode });
};

/**
 * Folder ids to request test cases (or executions) for: only the folder itself,
 * or the folder and all its subfolders in the "All test cases within subfolders" mode.
 */
export const getFolderIdsForViewMode = (
  folderId: number,
  folders: BaseFolder[],
  viewMode: FolderTreeViewMode,
): number[] =>
  viewMode === FolderTreeViewMode.SUBFOLDERS ? getAllSubfolderIds(folderId, folders) : [folderId];
