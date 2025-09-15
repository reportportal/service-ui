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
