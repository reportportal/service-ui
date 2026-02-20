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

import type { Folder } from 'controllers/testCase/types';

export const hasFolderParent = (
  folder: Folder,
): folder is Folder & { parentFolderId: number | null } => {
  return 'parentFolderId' in folder;
};

export interface DropTargetInfo {
  parentFolderId: number | null | undefined;
  index?: number;
}

export interface MoveFolderParams {
  folderId: number;
  parentTestFolderId: number | null | undefined;
  index?: number;
  fromDragDrop: boolean;
}

export interface DuplicateFolderParams {
  folderId: number;
  folderName: string;
  parentFolderId: number | null | undefined;
  index?: number;
  fromDragDrop: boolean;
}

export interface UseFolderDragDropParams {
  folders: Folder[];
  onMove: (params: MoveFolderParams) => void;
  onDuplicate: (params: DuplicateFolderParams) => void;
}
