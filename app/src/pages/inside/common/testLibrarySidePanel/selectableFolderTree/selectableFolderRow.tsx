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

import { useCallback, useMemo, CSSProperties } from 'react';
import { ChevronDownDropdownIcon, DragNDropIcon } from '@reportportal/ui-kit';
import { useSelector } from 'react-redux';

import { createClassnames } from 'common/utils';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { useDraggableRow } from 'components/main/draggableTableRow';
import { transformedFoldersSelector, TransformedFolder } from 'controllers/testCase';

import { DepthAwareCheckbox } from '../depthAwareCheckbox';
import { usePanelActions, usePanelState, CheckboxSelectionState } from '../testLibraryPanelContext';
import { ConnectorLines, INDENT_PX } from '../../expandedOptions/folder/connectorLines';
import { FOLDER_DRAG_TYPE, FolderDragItem } from '../constants';
import { useFolderDragOpacity } from '../hooks/useDragOpacity';
import type { FlatSelectableRow } from './useFlattenedSelectableTree';

import treeStyles from '../../expandedOptions/folder/folder.scss';
import selectableStyles from '../selectableFolder/selectableFolder.scss';

const cx = createClassnames(selectableStyles, treeStyles);

const BASE_INDENT_PX = 48;
const FOLDER_ROW_SELECTOR = '.selectable-folder-row-global';

const getSelectableSubtreeTestsCount = (
  folder: TransformedFolder,
  testPlanCountByFolderId: Map<number, number>,
): number => {
  const addedCount = testPlanCountByFolderId.get(folder.id) ?? 0;
  const selectableCurrentFolderCount = Math.max(0, folder.testsCount - addedCount);

  return (
    selectableCurrentFolderCount +
    folder.folders.reduce(
      (sum, nestedFolder) => sum + getSelectableSubtreeTestsCount(nestedFolder, testPlanCountByFolderId),
      0,
    )
  );
};

type FolderRow = Extract<FlatSelectableRow, { type: 'folder' }>;

interface SelectableFolderRowProps {
  row: FolderRow;
  nextRowDepth: number;
  style?: CSSProperties;
}

export const SelectableFolderRow = ({ row, nextRowDepth, style }: SelectableFolderRowProps) => {
  const { folder, depth, isOpen, hasChildren, connectorDepths, isLastChild } = row;
  const { toggleFolder, batchSelectFolder, batchDeselectFolder } = usePanelActions();
  const { checkboxStatesMap, batchLoadingFolderIds, testPlanCountByFolderId } = usePanelState();
  const { canManageTestCases } = useUserPermissions();
  const flatFolders = useSelector(transformedFoldersSelector);

  const checkboxState = checkboxStatesMap.get(folder.id) ?? CheckboxSelectionState.UNCHECKED;
  const isBatchLoading = batchLoadingFolderIds.has(folder.id);
  const canDrag = canManageTestCases && (folder.testsCount > 0 || hasChildren);

  const handleToggle = useCallback(() => {
    if (hasChildren) {
      toggleFolder(folder);
    }
  }, [folder, hasChildren, toggleFolder]);

  const handleCheckboxChange = useCallback(() => {
    if (checkboxState === CheckboxSelectionState.CHECKED) {
      batchDeselectFolder(folder);
    } else {
      void batchSelectFolder(folder);
    }
  }, [checkboxState, batchDeselectFolder, batchSelectFolder, folder]);

  const flatFoldersMap = useMemo(
    () => new Map(flatFolders.map((flatFolder) => [flatFolder.id, flatFolder])),
    [flatFolders],
  );

  const selectedRootFolders = useMemo(() => {
    const checkedFolderIds = new Set(
      Array.from(checkboxStatesMap.entries())
        .filter(([, state]) => state === CheckboxSelectionState.CHECKED)
        .map(([id]) => id),
    );

    const rootFolders: TransformedFolder[] = [];

    checkedFolderIds.forEach((id) => {
      const checkedFolder = flatFoldersMap.get(id);

      if (!checkedFolder) {
        return;
      }

      if (!checkedFolder.parentFolderId || !checkedFolderIds.has(checkedFolder.parentFolderId)) {
        rootFolders.push(checkedFolder);
      }
    });

    return rootFolders;
  }, [checkboxStatesMap, flatFoldersMap]);

  const selectedRootFolderIds = useMemo(
    () => new Set(selectedRootFolders.map(({ id }) => id)),
    [selectedRootFolders],
  );

  const dragItem: FolderDragItem = useMemo(() => {
    const shouldDragSelection =
      checkboxState === CheckboxSelectionState.CHECKED &&
      selectedRootFolders.length > 1 &&
      selectedRootFolderIds.has(folder.id);
    const folders = shouldDragSelection ? selectedRootFolders : [folder];
    const testCasesCount = folders.reduce(
      (sum, selectedFolder) =>
        sum + getSelectableSubtreeTestsCount(selectedFolder, testPlanCountByFolderId),
      0,
    );

    return {
      folder,
      folders,
      isMulti: folders.length > 1,
      testCasesCount,
    };
  }, [
    checkboxState,
    folder,
    selectedRootFolderIds,
    selectedRootFolders,
    testPlanCountByFolderId,
  ]);

  const isDimmed = useFolderDragOpacity(folder.id, checkboxState);

  const { dragSourceRef, handleDragHandleMouseDown } = useDraggableRow<FolderDragItem>({
    type: FOLDER_DRAG_TYPE,
    item: dragItem,
    canDrag,
    rowSelector: FOLDER_ROW_SELECTOR,
  });

  return (
    <div
      ref={dragSourceRef}
      className={cx('folders-tree__item', 'selectable-tree__item', 'selectable-folder-row-global', {
        'folders-tree__item--open': isOpen,
        'selectable-tree__item--dimmed': isDimmed,
      })}
      role="treeitem"
      tabIndex={0}
      aria-level={depth + 1}
      aria-expanded={hasChildren ? isOpen : undefined}
      aria-selected={checkboxState === CheckboxSelectionState.CHECKED}
      style={{ ...style, paddingLeft: BASE_INDENT_PX + depth * INDENT_PX }}
    >
      <ConnectorLines
        depth={depth}
        connectorDepths={connectorDepths}
        nextRowDepth={nextRowDepth}
        isLastChild={isLastChild}
        baseIndent={BASE_INDENT_PX}
      />
      <div
        className={cx('folders-tree__item-content', 'selectable-tree__item-content', {
          'selectable-tree__item-empty': !hasChildren,
        })}
      >
        {hasChildren && <ChevronDownDropdownIcon onClick={handleToggle} />}
        <button
          className={cx('folders-tree__item-title', 'selectable-tree__item-title')}
          onClick={handleToggle}
        >
          <span className={cx('folders-tree__item-title--text')} title={folder.name}>
            {folder.name}
          </span>
        </button>
        {canDrag && (
          <span
            className={cx('selectable-tree__item-drag-handle', {
              'selectable-tree__item-drag-handle--draggable': canDrag,
            })}
            onMouseDown={handleDragHandleMouseDown}
          >
            <DragNDropIcon />
          </span>
        )}
        <DepthAwareCheckbox
          depth={depth}
          isChecked={checkboxState === CheckboxSelectionState.CHECKED}
          isPartiallyChecked={checkboxState === CheckboxSelectionState.INDETERMINATE}
          onChange={handleCheckboxChange}
          isLoading={isBatchLoading}
        />
      </div>
    </div>
  );
};
