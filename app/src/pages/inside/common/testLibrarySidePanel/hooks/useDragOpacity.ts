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

import { useDragLayer } from 'react-dnd';

import { TransformedFolder } from 'controllers/testCase';

import {
  FOLDER_DRAG_TYPE,
  TEST_CASE_DRAG_TYPE,
  FolderDragItem,
  TestCaseDragItem,
} from '../constants';
import { CheckboxSelectionState } from '../testLibraryPanelContext';

const isInFolderSubtree = (folderId: number, root: TransformedFolder) => {
  if (root.id === folderId) {
    return true;
  }

  return root.folders.some((child) => isInFolderSubtree(folderId, child));
};

export const useFolderDragOpacity = (folderId: number, checkboxState: CheckboxSelectionState) => {
  const { isDragging, itemType, item } = useDragLayer((monitor) => ({
    isDragging: monitor.isDragging(),
    itemType: monitor.getItemType(),
    item: monitor.getItem(),
  }));

  if (!isDragging || !item) {
    return false;
  }

  if (itemType === FOLDER_DRAG_TYPE) {
    const folderItem = item as FolderDragItem;

    return folderItem.folders.some((draggedFolder) => isInFolderSubtree(folderId, draggedFolder));
  }

  if (itemType === TEST_CASE_DRAG_TYPE) {
    const testCaseItem = item as TestCaseDragItem;

    return testCaseItem.isMulti && checkboxState === CheckboxSelectionState.CHECKED;
  }

  return false;
};

export const useTestCaseDragOpacity = (testCaseId: number, folderId: number) => {
  const { isDragging, itemType, item } = useDragLayer((monitor) => ({
    isDragging: monitor.isDragging(),
    itemType: monitor.getItemType(),
    item: monitor.getItem(),
  }));

  if (!isDragging || !item) {
    return false;
  }

  if (itemType === TEST_CASE_DRAG_TYPE) {
    const testCaseItem = item as TestCaseDragItem;

    return testCaseItem.ids.includes(testCaseId);
  }

  if (itemType === FOLDER_DRAG_TYPE) {
    const folderItem = item as FolderDragItem;

    return folderItem.folders.some((draggedFolder) => isInFolderSubtree(folderId, draggedFolder));
  }

  return false;
};
