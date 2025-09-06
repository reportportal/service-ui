import { Folder } from './types';

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
