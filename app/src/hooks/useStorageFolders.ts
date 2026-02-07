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

import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { INSTANCE_SELECTOR_MAP, TMS_INSTANCE_KEY } from 'pages/inside/common/constants';
import { setStorageItem } from 'common/utils/storageUtils';
import {
  expandedFolderIdsSelector,
  toggleFolderExpansionAction,
  expandFoldersToLevelAction,
  Folder,
} from 'controllers/testCase';
import {
  manualLaunchExpandedFolderIdsSelector,
  manualLaunchFoldersSelector,
  toggleManualLaunchFolderExpansionAction,
  expandManualLaunchFoldersToLevelAction,
} from 'controllers/manualLaunch';
import { getExpandedFoldersStorageKey } from 'controllers/testCase/utils/getExpandedFoldersStorageKey';

import { useTestPlanId } from './useTypedSelector';

// Config mapper for each instance
const STORAGE_FOLDERS_CONFIG = {
  [TMS_INSTANCE_KEY.TEST_CASE]: {
    expandedIdsSelector: expandedFolderIdsSelector,
    foldersSelector,
    toggleFolderAction: toggleFolderExpansionAction,
    expandToLevelAction: expandFoldersToLevelAction,
  },
  [TMS_INSTANCE_KEY.TEST_PLAN]: {
    expandedIdsSelector: expandedFolderIdsSelector,
    foldersSelector,
    toggleFolderAction: toggleFolderExpansionAction,
    expandToLevelAction: expandFoldersToLevelAction,
  },
  [TMS_INSTANCE_KEY.MANUAL_LAUNCH]: {
    expandedIdsSelector: manualLaunchExpandedFolderIdsSelector,
    foldersSelector: manualLaunchFoldersSelector,
    toggleFolderAction: toggleManualLaunchFolderExpansionAction,
    expandToLevelAction: expandManualLaunchFoldersToLevelAction,
  },
};

export const useStorageFolders = (instanceKey: TMS_INSTANCE_KEY) => {
  const { expandedIdsSelector, foldersSelector, toggleFolderAction, expandToLevelAction } =
    STORAGE_FOLDERS_CONFIG[instanceKey];
  const storageKey = getExpandedFoldersStorageKey(instanceKey);
  const dispatch = useDispatch();
  const expandedIds = useSelector(expandedIdsSelector);
  const folders = useSelector(foldersSelector);
  const isMountedRef = useRef(false);
  
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    setStorageItem(storageKey, expandedIds);
  }, [expandedIds, storageKey]);

  const onToggleFolder = useCallback(
    (folder: { id: number }) => {
      dispatch(toggleFolderAction({ folderId: folder.id, folders }));
    },
    [dispatch, folders, toggleFolderAction],
  );

  const expandFoldersUpToLevel = useCallback(
    (folderId: number) => {
      dispatch(expandToLevelAction({ folderId, folders }));
    },
    [dispatch, folders, expandToLevelAction],
  );

  return {
    expandedIds,
    onToggleFolder,
    expandFoldersUpToLevel,
  };
};
