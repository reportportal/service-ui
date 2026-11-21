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

import { isEmpty } from 'es-toolkit/compat';

import { Folder, FolderWithFullPath } from './types';

const groupByParentId = (folders: Folder[]): Map<number, Folder[]> => {
  const childrenByParentId = new Map<number, Folder[]>();

  folders.forEach((folder) => {
    if (folder.parentFolderId) {
      const siblings = childrenByParentId.get(folder.parentFolderId);

      if (siblings) {
        siblings.push(folder);
      } else {
        childrenByParentId.set(folder.parentFolderId, [folder]);
      }
    }
  });

  return childrenByParentId;
};

const addSubfoldersToFolder = (
  folder: Folder,
  childrenByParentId: Map<number, Folder[]>,
): Folder => {
  const subFolders = childrenByParentId.get(folder.id) ?? [];

  const mappedSubFolders = subFolders.map((subFolder) =>
    addSubfoldersToFolder(subFolder, childrenByParentId),
  );

  return { ...folder, subFolders: mappedSubFolders };
};

const buildFoldersPath = (folderName: string, parentFolderName?: string) =>
  parentFolderName ? `${parentFolderName} / ${folderName}` : folderName;

// Children are grouped by parent once, so building the tree is O(n) instead of O(n^2).
export const buildFoldersMap = (folders: Folder[], parentFolders: Folder[] = []): Folder[] => {
  const childrenByParentId = groupByParentId(folders);

  return folders.reduce((mergedFolders: Folder[], folder) => {
    if (!folder.parentFolderId) {
      const folderWithSubfolders = addSubfoldersToFolder(folder, childrenByParentId);
      mergedFolders.push(folderWithSubfolders);
    }

    return mergedFolders;
  }, parentFolders);
};

export const traverseFolders = (
  folders: Folder[],
  parentFolderName?: string,
  parentFolders: FolderWithFullPath[] = [],
): FolderWithFullPath[] => {
  return folders.reduce((mergedFolders: FolderWithFullPath[], folder: Folder) => {
    if (!isEmpty(folder.subFolders)) {
      traverseFolders(
        folder.subFolders,
        buildFoldersPath(folder.name, parentFolderName),
        parentFolders,
      );
    }

    parentFolders.push({
      id: folder.id,
      description: folder.description,
      name: folder.name,
      fullPath: buildFoldersPath(folder.name, parentFolderName),
    });

    return mergedFolders;
  }, parentFolders);
};

export const transformFoldersWithFullPath = (folders: Folder[]): FolderWithFullPath[] =>
  traverseFolders(buildFoldersMap(folders));
