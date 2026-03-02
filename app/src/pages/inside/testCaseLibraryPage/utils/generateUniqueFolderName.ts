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

/**
 * Get sibling folders in the target parent, excluding the dragged folder
 * @param allFolders - Array of all folders
 * @param targetParentId - ID of the target parent folder
 * @param excludeFolderId - ID of the folder to exclude (usually the dragged folder)
 * @returns Array of sibling folders
 */
export const getTargetParentSiblings = <T extends { id: number; parentFolderId: number | null }>(
  allFolders: T[],
  targetParentId: number | null,
  excludeFolderId: number,
): T[] => {
  return allFolders.filter((f) => f.parentFolderId === targetParentId && f.id !== excludeFolderId);
};

/**
 * Generate a unique folder name by adding (1), (2), etc. suffix
 * @param baseName - The base name of the folder
 * @param existingFolders - Array of existing folders to check for name conflicts
 * @returns A unique folder name with (number) suffix
 */
export const generateUniqueFolderName = (
  baseName: string,
  existingFolders: Array<{ name: string }>,
): string => {
  const baseNamePattern = baseName.replace(/\s*\(\d+\)$/, '');
  let counter = 1;
  let newName = `${baseNamePattern} (${counter})`;

  while (existingFolders.some((folder) => folder.name === newName)) {
    counter += 1;
    newName = `${baseNamePattern} (${counter})`;
  }

  return newName;
};
