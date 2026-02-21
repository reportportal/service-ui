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

import type { TreeDropPosition } from '@reportportal/ui-kit/common';
import { TREE_DROP_POSITIONS } from '@reportportal/ui-kit/common';
import { isUndefined } from 'es-toolkit/compat';
import type { Folder } from 'controllers/testCase/types';

export const getMaxChildIndex = (folders: Folder[], parentId: number): number => {
  const children = folders.filter((f) => f.parentFolderId === parentId);

  if (children.length === 0) {
    return -1;
  }

  return Math.max(...children.map((f) => f.index ?? 0), 0);
};

export const getParentFolderId = (
  targetFolder: Folder,
  position: TreeDropPosition,
): number | null | undefined => {
  if (position === TREE_DROP_POSITIONS.INSIDE) {
    return targetFolder.id;
  }

  return targetFolder.parentFolderId;
};

export const calculateDropIndex = (
  targetFolder: Folder,
  position: TreeDropPosition,
  folders: Folder[],
  draggedFolderId?: number,
  isDuplicate?: boolean,
): number | undefined => {
  const draggedFolder = draggedFolderId ? folders.find((f) => f.id === draggedFolderId) : undefined;
  const draggedIndex = draggedFolder?.index;

  let targetIndex = targetFolder.index;
  if (isUndefined(targetIndex)) {
    const targetParentId = targetFolder.parentFolderId ?? null;
    const siblings = folders
      .filter((f) => (f.parentFolderId ?? null) === targetParentId && !isUndefined(f.index))
      .sort((a, b) => (a.index ?? 0) - (b.index ?? 0));

    const targetPositionInSiblings = siblings.findIndex((f) => f.id === targetFolder.id);
    targetIndex =
      targetPositionInSiblings >= 0 ? (siblings[targetPositionInSiblings].index ?? 0) : 0;
  }

  const draggedParentId = draggedFolder?.parentFolderId ?? null;
  const targetParentId = targetFolder.parentFolderId ?? null;
  const sameParent = draggedParentId === targetParentId;

  const isMovingDownWithinSameParent =
    !isDuplicate && sameParent && !isUndefined(draggedIndex) && draggedIndex < targetIndex;

  if (position === TREE_DROP_POSITIONS.INSIDE) {
    const maxIndex = getMaxChildIndex(folders, targetFolder.id);
    return maxIndex + 1;
  }

  if (position === TREE_DROP_POSITIONS.BEFORE) {
    if (isMovingDownWithinSameParent) {
      return targetIndex - 1;
    }
    return targetIndex;
  }

  if (position === TREE_DROP_POSITIONS.AFTER) {
    if (isMovingDownWithinSameParent) {
      return targetIndex;
    }
    return targetIndex + 1;
  }

  return undefined;
};
