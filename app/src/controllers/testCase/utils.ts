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

import { Folder, TransformedFolder } from './types';

export const getAllFolderIdsToDelete = (targetId: number, folderList: Folder[]): number[] => {
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

export const transformFoldersToDisplay = (folders: Folder[]): TransformedFolder[] => {
  if (folders.length === 0) {
    return [];
  }

  const folderMap = new Map<number | null, TransformedFolder>();
  // Add virtual root folder
  folderMap.set(null, { id: 0, name: '', testsCount: 0, parentFolderId: null, folders: [] });

  folders.forEach((folder) => {
    folderMap.set(folder.id, {
      name: folder.name,
      testsCount: folder.countOfTestCases || 0,
      description: folder.description,
      id: folder.id,
      parentFolderId: folder.parentFolderId,
      folders: [],
    });
  });

  folders.forEach((folder) => {
    const transformedFolder = folderMap.get(folder.id);
    if (!transformedFolder) return;

    let parentFolder = folderMap.get(folder.parentFolderId);

    if (!parentFolder) {
      parentFolder = folderMap.get(null);
    }

    parentFolder.folders.push(transformedFolder);
  });

  return folderMap.get(null).folders;
};
