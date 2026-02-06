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
  TransformedFolder,
  expandedFolderIdsSelector,
  toggleFolderExpansionAction,
  expandFoldersToLevelAction,
  Folder,
} from 'controllers/testCase';
import { getExpandedFoldersStorageKey } from 'controllers/testCase/utils/getExpandedFoldersStorageKey';
import { setInitialExpandedFoldersAction } from 'controllers/testCase/actionCreators';

import { useTestPlanId } from './useTypedSelector';

export const useStorageFolders = (instanceKey: TMS_INSTANCE_KEY) => {
  const testPlanId = useTestPlanId();
  const updatedInstanceKey = testPlanId ? `${instanceKey}${testPlanId}` : instanceKey;
  const storageKey = getExpandedFoldersStorageKey(updatedInstanceKey);
  const dispatch = useDispatch();
  const selector = INSTANCE_SELECTOR_MAP[instanceKey]
  const expandedIds = useSelector(expandedFolderIdsSelector);
  const folders = useSelector(selector) as Folder[];
  const isMountedRef = useRef(false);
  
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;

      return;
    }

    setStorageItem(storageKey, expandedIds);
  }, [expandedIds, storageKey]);

  useEffect(() => {
   dispatch(setInitialExpandedFoldersAction(storageKey))
  }, [dispatch, storageKey]);

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
