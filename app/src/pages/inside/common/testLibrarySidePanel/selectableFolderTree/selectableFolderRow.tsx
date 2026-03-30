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

import { useCallback, CSSProperties } from 'react';
import { ChevronDownDropdownIcon, DragNDropIcon } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';

import { DepthAwareCheckbox } from '../depthAwareCheckbox';
import { usePanelActions, usePanelState, CheckboxSelectionState } from '../testLibraryPanelContext';
import { ConnectorLines, INDENT_PX } from '../../expandedOptions/folder/connectorLines';
import type { FlatSelectableRow } from './useFlattenedSelectableTree';

import treeStyles from '../../expandedOptions/folder/folder.scss';
import selectableStyles from '../selectableFolder/selectableFolder.scss';

const cx = createClassnames(selectableStyles, treeStyles);

const BASE_INDENT_PX = 48;

type FolderRow = Extract<FlatSelectableRow, { type: 'folder' }>;

interface SelectableFolderRowProps {
  row: FolderRow;
  nextRowDepth: number;
  style?: CSSProperties;
}

export const SelectableFolderRow = ({ row, nextRowDepth, style }: SelectableFolderRowProps) => {
  const { folder, depth, isOpen, hasChildren, connectorDepths, isLastChild } = row;
  const { toggleFolder, batchSelectFolder, batchDeselectFolder } = usePanelActions();
  const { checkboxStatesMap, batchLoadingFolderIds } = usePanelState();

  const checkboxState = checkboxStatesMap.get(folder.id) ?? CheckboxSelectionState.UNCHECKED;
  const isBatchLoading = batchLoadingFolderIds.has(folder.id);

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

  return (
    <div
      className={cx('folders-tree__item', 'selectable-tree__item', {
        'folders-tree__item--open': isOpen,
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
        <span>
          <DragNDropIcon />
        </span>
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
