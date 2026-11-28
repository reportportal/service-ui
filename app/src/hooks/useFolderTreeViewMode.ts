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

import { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import {
  FolderTreeViewMode,
  FolderTreeViewModeScope,
  getFolderTreeViewMode,
  saveFolderTreeViewMode,
} from 'common/utils/folderUtils';
import { userIdSelector } from 'controllers/user';
import { TMS_INSTANCE_KEY } from 'pages/inside/common/constants';

const VIEW_MODE_SCOPE_BY_INSTANCE: Record<TMS_INSTANCE_KEY, FolderTreeViewModeScope> = {
  [TMS_INSTANCE_KEY.TEST_CASE]: FolderTreeViewModeScope.TEST_CASE_LIBRARY,
  [TMS_INSTANCE_KEY.TEST_PLAN]: FolderTreeViewModeScope.TEST_PLAN,
  [TMS_INSTANCE_KEY.MANUAL_LAUNCH]: FolderTreeViewModeScope.MANUAL_LAUNCH,
};

export interface UseFolderTreeViewModeParams {
  instanceKey: TMS_INSTANCE_KEY;
  scopeId?: string | number | null;
}

export const useFolderTreeViewMode = ({ instanceKey, scopeId }: UseFolderTreeViewModeParams) => {
  const userId = useSelector(userIdSelector) as string | undefined;
  const scope = VIEW_MODE_SCOPE_BY_INSTANCE[instanceKey];
  const storageScopeKey = `${String(userId)}|${scope}|${String(scopeId)}`;
  const [selected, setSelected] = useState<{
    storageScopeKey: string;
    viewMode: FolderTreeViewMode;
  } | null>(null);

  const storedViewMode = useMemo(
    () => getFolderTreeViewMode(userId, scope, scopeId),
    [userId, scope, scopeId],
  );
  // A new user or scope (another launch or test plan) reads its own stored mode.
  const viewMode =
    selected?.storageScopeKey === storageScopeKey ? selected.viewMode : storedViewMode;

  // The value is written to storage right away: list requests read it from there.
  const setViewMode = useCallback(
    (nextViewMode: FolderTreeViewMode) => {
      saveFolderTreeViewMode(userId, scope, scopeId, nextViewMode);
      setSelected({ storageScopeKey, viewMode: nextViewMode });
    },
    [userId, scope, scopeId, storageScopeKey],
  );

  return {
    viewMode,
    setViewMode,
  };
};
