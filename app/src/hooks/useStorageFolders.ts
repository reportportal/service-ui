import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { TMS_INSTANCE_KEY } from 'pages/inside/common/constants';
import { setStorageItem } from 'common/utils/storageUtils';
import {
  expandedFolderIdsSelector,
  toggleFolderExpansionAction,
  expandFoldersToLevelAction,
  foldersSelector,
} from 'controllers/testCase';
import {
  manualLaunchExpandedFolderIdsSelector,
  manualLaunchFoldersSelector,
  toggleManualLaunchFolderExpansionAction,
  expandManualLaunchFoldersToLevelAction,
} from 'controllers/manualLaunch';
import { getExpandedFoldersStorageKey } from 'controllers/testCase/utils/getExpandedFoldersStorageKey';

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
