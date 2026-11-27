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

import { getParentFolders } from 'common/utils/folderUtils';
import { Folder } from 'controllers/testCase/types';

export interface FolderCrumb {
  id: number;
  name: string;
}

// Test Case Library + three nearest parent folders + test case
export const MAX_SHOWN_CRUMBS = 5;
const NEAREST_FOLDERS_COUNT = MAX_SHOWN_CRUMBS - 2;

export const getFolderPath = (
  folderId: number | null | undefined,
  folders: Folder[],
): FolderCrumb[] => {
  if (!folderId) {
    return [];
  }

  return getParentFolders(folderId, folders)
    .reverse()
    .map(({ id, name }) => ({ id, name }));
};

export const splitFolderPath = (path: FolderCrumb[]) => {
  if (path.length <= NEAREST_FOLDERS_COUNT) {
    return { hiddenFolders: [] as FolderCrumb[], shownFolders: path };
  }

  return {
    hiddenFolders: path.slice(0, -NEAREST_FOLDERS_COUNT),
    shownFolders: path.slice(-NEAREST_FOLDERS_COUNT),
  };
};
