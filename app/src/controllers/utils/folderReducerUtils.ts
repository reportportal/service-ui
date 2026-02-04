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

import { isNumber } from 'es-toolkit/compat';

import { getStorageItem, setStorageItem } from 'common/utils/storageUtils';
import { TMS_INSTANCE_KEY } from 'pages/inside/common/constants';
import { getExpandedFoldersStorageKey } from 'controllers/testCase/utils/getExpandedFoldersStorageKey';

import { FolderWithId } from './types';

export const getInitialExpandedFolderIds = (instanceKey: TMS_INSTANCE_KEY): number[] => {
  try {
    const storageKey = getExpandedFoldersStorageKey(instanceKey);
    const parsed = getStorageItem(storageKey) as number[] | null;

    if (Array.isArray(parsed) && parsed.every(isNumber)) {
      return parsed;
    }

    return [];
  } catch {
    return [];
  }
};

export const saveExpandedFolderIds = (instanceKey: TMS_INSTANCE_KEY, folderIds: number[]) => {
  const storageKey = getExpandedFoldersStorageKey(instanceKey);

  setStorageItem(storageKey, folderIds);
};

export const getFolderAndDescendantIds = <T extends FolderWithId>(
  folders: T[],
  folderId: number,
): number[] => {
  const childIds: number[] = [];

  const collectChildren = (parentId: number) => {
    folders.forEach((folder) => {
      if (folder.parentFolderId === parentId) {
        childIds.push(folder.id);
        collectChildren(folder.id);
      }
    });
  };

  childIds.push(folderId);

  collectChildren(folderId);

  return childIds;
};
