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

import { useMemo } from 'react';
import { isEmpty } from 'es-toolkit/compat';

import { Folder } from 'controllers/testCase/types';

export const useGenerateFolderPath = (
  folderId: number | null | undefined,
  folders: Folder[],
): string[] => {
  return useMemo(() => {
    if (!folderId || !folders || isEmpty(folders)) {
      return [];
    }

    const folderMap = new Map<number, Folder>();

    folders.forEach((folder) => {
      folderMap.set(folder.id, folder);
    });

    const path: string[] = [];

    let currentFolderId: number | null = folderId;

    while (currentFolderId !== null) {
      const folder = folderMap.get(currentFolderId);

      if (!folder) {
        break;
      }

      path.unshift(folder.name);
      currentFolderId = folder.parentFolderId;
    }

    return path;
  }, [folderId, folders]);
};
