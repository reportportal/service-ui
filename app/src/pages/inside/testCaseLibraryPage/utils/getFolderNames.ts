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

import { Folder } from 'controllers/testCase/types';

/**
 * Get folder names for notification messages
 * @param allFolders - Array of all folders
 * @param folderId - ID of the folder being operated on
 * @param targetParentId - ID of the target parent folder (null for root folder)
 * @returns Object with folderName and targetFolderName (without quotes or i18n keys)
 */
export const getFolderNames = (
  allFolders: Folder[],
  folderId: number,
  targetParentId: number | null,
): { folderName: string; targetFolderName: string | null } => {
  const folder = allFolders.find((f) => f.id === folderId);
  const targetFolder = targetParentId ? allFolders.find((f) => f.id === targetParentId) : null;

  return {
    folderName: folder?.name || '',
    targetFolderName: targetFolder?.name || null,
  };
};
