/*
 * Copyright 2025 EPAM Systems
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

import { isEmpty, isNil } from 'es-toolkit/compat';

export interface BaseFolder {
  id: number;
  name: string;
  description?: string;
  countOfTestCases?: number;
  parentFolderId?: number | null;
  index?: number;
}

export interface TransformedFolder {
  id: number;
  name: string;
  description?: string;
  testsCount: number;
  parentFolderId: number | null;
  index?: number;
  folders: TransformedFolder[];
}

/**
 * Transforms a flat list of folders into a hierarchical structure for display
 * This is a shared utility used across test cases, test plans, and manual launches
 */
export const transformFoldersToDisplay = (folders: BaseFolder[]): TransformedFolder[] => {
  if (isEmpty(folders)) {
    return [];
  }

  const folderMap = new Map<number | null, TransformedFolder>();

  folderMap.set(null, { id: 0, name: '', testsCount: 0, parentFolderId: null, folders: [] });

  folders.forEach((folder) => {
    folderMap.set(folder.id, {
      name: folder.name,
      testsCount: folder.countOfTestCases || 0,
      description: folder.description,
      id: folder.id,
      parentFolderId: folder.parentFolderId ?? null,
      index: folder.index,
      folders: [],
    });
  });

  folders.forEach((folder) => {
    const transformedFolder = folderMap.get(folder.id);
    if (!transformedFolder) return;

    const parentFolder = folderMap.get(folder.parentFolderId ?? null) || folderMap.get(null);

    if (parentFolder) {
      parentFolder.folders.push(transformedFolder);
    }
  });

  const sortFolders = (folders: TransformedFolder[]): TransformedFolder[] => {
    const sortedFolders = [...folders];
    sortedFolders.sort((a, b) => {
      if (!isNil(a.index) && !isNil(b.index)) {
        return a.index - b.index;
      }

      if (!isNil(a.index)) return -1;

      if (!isNil(b.index)) return 1;

      return 0;
    });

    return sortedFolders.map((folder) => ({
      ...folder,
      folders: sortFolders(folder.folders),
    }));
  };

  const rootFolders = folderMap.get(null)?.folders || [];
  return sortFolders(rootFolders);
};

/**
 * Recursively collects all folder IDs that should be deleted when a folder is deleted
 * (including all subfolders)
 */
export const getAllFolderIdsToDelete = (targetId: number, folderList: BaseFolder[]): number[] => {
  const idsToDelete: number[] = [];

  const collectIds = (id: number) => {
    idsToDelete.push(id);

    folderList.forEach((folder) => {
      if (folder.parentFolderId === id) {
        collectIds(folder.id);
      }
    });
  };

  collectIds(targetId);

  return idsToDelete;
};

/**
 * Recursively collects all subfolder IDs for a given folder
 */
export const getAllSubfolderIds = (folderId: number, folders: BaseFolder[]): number[] => {
  const subfolderIds: number[] = [folderId];

  const collectSubfolderIds = (parentId: number) => {
    folders.forEach((folder) => {
      if (folder.parentFolderId === parentId) {
        subfolderIds.push(folder.id);
        collectSubfolderIds(folder.id);
      }
    });
  };

  collectSubfolderIds(folderId);

  return subfolderIds;
};
