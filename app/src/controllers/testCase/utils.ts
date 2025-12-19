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

import { Folder, FolderWithFullPath, TransformedFolder } from './types';

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
  if (isEmpty(folders)) {
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

    const parentFolder = folderMap.get(folder.parentFolderId) || folderMap.get(null);

    parentFolder.folders.push(transformedFolder);
  });

  return folderMap.get(null).folders;
};

const addSubfoldersToFolder = (folder: Folder, otherPlainFolders: Folder[]): Folder => {
  const subFolders = otherPlainFolders.filter(({ parentFolderId }) => parentFolderId === folder.id);

  const mappedSubFolders = subFolders.map((subFolder) =>
    addSubfoldersToFolder(subFolder, otherPlainFolders),
  );

  return { ...folder, subFolders: mappedSubFolders };
};

const buildFoldersPath = (folderName: string, parentFolderName?: string) =>
  parentFolderName ? `${parentFolderName} / ${folderName}` : folderName;

export const buildFoldersMap = (folders: Folder[], parentFolders: Folder[] = []): Folder[] => {
  return folders.reduce((mergedFolders: Folder[], folder) => {
    if (!folder.parentFolderId) {
      const folderWithSubfolders = addSubfoldersToFolder(folder, folders);

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
