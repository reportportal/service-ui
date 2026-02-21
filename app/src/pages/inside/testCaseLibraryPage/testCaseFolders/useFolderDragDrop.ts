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

import { useCallback } from 'react';
import type { TreeDragItem, TreeDropPosition } from '@reportportal/ui-kit/common';
import { getParentFolderId, calculateDropIndex } from './dragDropUtils';
import type { UseFolderDragDropParams } from './types';

export const useFolderDragDrop = ({ folders, onMove, onDuplicate }: UseFolderDragDropParams) => {
  const handleMoveFolder = useCallback(
    (draggedItem: TreeDragItem, targetId: string | number, position: TreeDropPosition) => {
      const draggedFolderId = Number(draggedItem.id);
      const targetFolderId = Number(targetId);
      const targetFolder = folders.find((f) => f.id === targetFolderId);

      if (!targetFolder) {
        return;
      }

      const parentFolderId = getParentFolderId(targetFolder, position);
      const index = calculateDropIndex(targetFolder, position, folders, draggedFolderId, false);

      onMove({
        folderId: draggedFolderId,
        parentFolderId,
        index,
        fromDragDrop: true,
      });
    },
    [onMove, folders],
  );

  const handleDuplicateFolder = useCallback(
    (draggedItem: TreeDragItem, targetId: string | number, position: TreeDropPosition) => {
      const draggedFolderId = Number(draggedItem.id);
      const targetFolderId = Number(targetId);
      const draggedFolderData = folders.find((f) => f.id === draggedFolderId);
      const targetFolder = folders.find((f) => f.id === targetFolderId);

      if (!draggedFolderData || !targetFolder) {
        return;
      }

      const parentFolderId = getParentFolderId(targetFolder, position);
      const index = calculateDropIndex(targetFolder, position, folders, draggedFolderId, true);

      onDuplicate({
        folderId: draggedFolderId,
        folderName: `${draggedFolderData.name} (Copy)`,
        parentFolderId,
        index,
        fromDragDrop: true,
      });
    },
    [onDuplicate, folders],
  );

  return {
    handleMoveFolder,
    handleDuplicateFolder,
  };
};
