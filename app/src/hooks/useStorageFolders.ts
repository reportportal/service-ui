import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { TMS_INSTANCE_KEY } from 'pages/inside/common/constants';
import { getStorageItem, setStorageItem } from 'common/utils/storageUtils';
import { AppState } from 'types/store';
import { FolderWithId } from 'controllers/utils/types';
import {
  expandedFolderIdsSelector,
  toggleFolderExpansionAction,
  expandFoldersToLevelAction,
  foldersSelector,
} from 'controllers/testCase';
import {
  testPlanExpandedFolderIdsSelector,
  testPlanFoldersSelector,
  toggleTestPlanFolderExpansionAction,
  expandTestPlanFoldersToLevelAction,
} from 'controllers/testPlan';
import { setTestPlanInitialExpandedFoldersAction } from 'controllers/testPlan/actionCreators';
import {
  manualLaunchExpandedFolderIdsSelector,
  manualLaunchFoldersSelector,
  toggleManualLaunchFolderExpansionAction,
  expandManualLaunchFoldersToLevelAction,
} from 'controllers/manualLaunch';
import { getExpandedFoldersStorageKey } from 'controllers/testCase/utils/getExpandedFoldersStorageKey';

import { useTestPlanId } from './useTypedSelector';

interface FolderExpansionParams {
  folderId: number;
  folders: FolderWithId[];
}

interface StorageFoldersConfigItem {
  expandedIdsSelector(state: AppState): number[];
  foldersSelector(state: AppState): FolderWithId[];
  toggleFolderAction(params: FolderExpansionParams): { type: string; payload: FolderExpansionParams };
  expandToLevelAction(params: FolderExpansionParams): { type: string; payload: FolderExpansionParams };
}

// Config mapper for each instance
const STORAGE_FOLDERS_CONFIG: Record<TMS_INSTANCE_KEY, StorageFoldersConfigItem> = {
  [TMS_INSTANCE_KEY.TEST_CASE]: {
    expandedIdsSelector: expandedFolderIdsSelector,
    foldersSelector,
    toggleFolderAction: toggleFolderExpansionAction,
    expandToLevelAction: expandFoldersToLevelAction,
  },
  [TMS_INSTANCE_KEY.TEST_PLAN]: {
    expandedIdsSelector: testPlanExpandedFolderIdsSelector,
    foldersSelector: testPlanFoldersSelector,
    toggleFolderAction: toggleTestPlanFolderExpansionAction,
    expandToLevelAction: expandTestPlanFoldersToLevelAction,
  },
  [TMS_INSTANCE_KEY.MANUAL_LAUNCH]: {
    expandedIdsSelector: manualLaunchExpandedFolderIdsSelector,
    foldersSelector: manualLaunchFoldersSelector,
    toggleFolderAction:
      toggleManualLaunchFolderExpansionAction as StorageFoldersConfigItem['toggleFolderAction'],
    expandToLevelAction:
      expandManualLaunchFoldersToLevelAction as StorageFoldersConfigItem['expandToLevelAction'],
  },
};

export const useStorageFolders = (instanceKey: TMS_INSTANCE_KEY) => {
  const { expandedIdsSelector, foldersSelector, toggleFolderAction, expandToLevelAction } =
    STORAGE_FOLDERS_CONFIG[instanceKey];
  const testPlanId = useTestPlanId();
  const storageKey = getExpandedFoldersStorageKey(instanceKey)
  const dispatch = useDispatch();
  const expandedIds = useSelector(expandedIdsSelector);
  const folders = useSelector(foldersSelector);
  const isMountedRef = useRef(false);

  useEffect(() => {
    if (testPlanId) {
      dispatch(setTestPlanInitialExpandedFoldersAction({ testPlanId }));
    }
  }, [testPlanId, dispatch]);

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    if (testPlanId) {
      const record = (getStorageItem(storageKey) as Record<string, number[]>) || {};
      record[testPlanId] = expandedIds;
      setStorageItem(storageKey, record);
    } else {
      setStorageItem(storageKey, expandedIds);
    }
  }, [expandedIds, storageKey, testPlanId]);

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
