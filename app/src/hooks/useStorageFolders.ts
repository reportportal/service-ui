import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { TMS_INSTANCE_KEY } from 'pages/inside/common/constants';
import { setStorageItem } from 'common/utils/storageUtils';
import {
  TransformedFolder,
  expandedFolderIdsSelector,
  toggleFolderExpansionAction,
  expandFoldersToLevelAction,
  foldersSelector,
} from 'controllers/testCase';
import { getExpandedFoldersStorageKey } from 'controllers/testCase/utils/getExpandedFoldersStorageKey';

export const useStorageFolders = (instanceKey?: TMS_INSTANCE_KEY) => {
  const storageKey = getExpandedFoldersStorageKey(instanceKey);
  const dispatch = useDispatch();
  const expandedIds = useSelector(expandedFolderIdsSelector);
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
    (folder: TransformedFolder) => {
      dispatch(toggleFolderExpansionAction({ folderId: folder.id, folders }));
    },
    [dispatch, folders],
  );

  const expandFoldersUpToLevel = useCallback(
    (folderId: number) => {
      dispatch(expandFoldersToLevelAction({ folderId, folders }));
    },
    [dispatch, folders],
  );

  return {
    expandedIds,
    onToggleFolder,
    expandFoldersUpToLevel,
  };
};
