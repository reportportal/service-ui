import { Folder } from 'controllers/testCase/types';
import { FolderWithFullPath } from './types';

const addSubfoldersToFolder = (folder: Folder, otherPlainFolders: Folder[]) => {
  const subFolders = otherPlainFolders.filter((f) => f.parentFolderId === folder.id);
  folder.subFolders = subFolders.map((subFolder) =>
    addSubfoldersToFolder(subFolder, otherPlainFolders),
  );

  return folder;
};

export const buildFoldersMap = (folders: Folder[], initialAcc: Folder[] = []): Folder[] => {
  return folders.reduce((acc: Folder[], folder) => {
    if (!folder.parentFolderId) {
      const folderWithSubfolders = addSubfoldersToFolder(folder, folders);
      acc.push(folderWithSubfolders);
    }

    return acc;
  }, initialAcc);
};

export const traverseFolders = (
  folders: Folder[],
  parentFolderName?: string,
  initialAcc: FolderWithFullPath[] = [],
): FolderWithFullPath[] => {
  return folders.reduce((acc: FolderWithFullPath[], folder: Folder) => {
    if (folder.subFolders?.length) {
      traverseFolders(
        folder.subFolders,
        parentFolderName ? `${parentFolderName} / ${folder.name}` : folder.name,
        initialAcc,
      );
    }

    initialAcc.push({
      id: folder.id,
      description: folder.description,
      name: folder.name,
      fullPath: parentFolderName ? `${parentFolderName} / ${folder.name}` : folder.name,
    });

    return acc;
  }, initialAcc);
};
