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

import { FolderWithFullPath } from 'controllers/testCase';

import { NewFolderData } from './getFolderFromFormValues';
import { FolderDestination } from './getFolderDestinationFromFormValues';

export const processFolderDestination = ({
  destination,
  responseFolderId,
}: {
  destination: FolderDestination | NewFolderData | FolderWithFullPath;
  responseFolderId?: number;
}): {
  isNewFolder: boolean;
  targetFolderId: number;
  newFolderDetails?: NewFolderData;
  existingFolderId?: number;
} => {
  const isNewFolderWithParentFolder =
    'parentTestFolder' in destination && Boolean(destination.parentTestFolder?.name);
  const isNewFolderData = 'name' in destination && !('fullPath' in destination);
  const isExistingFolderWithId = 'id' in destination;
  const isExistingFolderWithParentId =
    'parentTestFolderId' in destination && destination.parentTestFolderId !== undefined;

  if (isNewFolderWithParentFolder) {
    return {
      isNewFolder: true,
      targetFolderId: responseFolderId,
      newFolderDetails: {
        name: destination.parentTestFolder.name ?? '',
        parentTestFolderId: destination.parentTestFolder.parentTestFolderId ?? null,
      },
    };
  }

  if (isNewFolderData) {
    return {
      isNewFolder: true,
      targetFolderId: responseFolderId,
      newFolderDetails: destination,
    };
  }

  if (isExistingFolderWithId) {
    return {
      isNewFolder: false,
      targetFolderId: destination.id,
      existingFolderId: destination.id,
    };
  }

  if (isExistingFolderWithParentId) {
    return {
      isNewFolder: false,
      targetFolderId: destination.parentTestFolderId,
      existingFolderId: destination.parentTestFolderId ?? undefined,
    };
  }

  return {
    isNewFolder: false,
    targetFolderId: responseFolderId,
    existingFolderId: responseFolderId,
  };
};
