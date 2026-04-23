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

import { useRef, useEffect, useCallback, CSSProperties } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { size } from 'es-toolkit/compat';
import { BubblesLoader } from '@reportportal/ui-kit';
import { TreeSortableItem } from '@reportportal/ui-kit/sortable';

import type { TreeDragItem, VoidFn } from '@reportportal/ui-kit/common';
import { createClassnames } from 'common/utils';
import { TransformedFolder } from 'controllers/testCase';
import { TMS_INSTANCE_KEY } from 'pages/inside/common/constants';

import { EmptySearchState } from 'pages/common/emptySearchState';
import { Folder } from '../folder/folder';
import { ROW_HEIGHT_PX } from '../folder/connectorLines';
import { useFlattenedTree, type FlatFolderNode } from '../useFlattenedTree';

import { FOLDER_DRAG_TYPE, EXTERNAL_TREE_DROP_TYPE } from '../constants';

import styles from './virtualFolderTree.scss';

const cx = createClassnames(styles);

export interface VirtualFolderTreeProps {
  folders: TransformedFolder[];
  expandedIds: number[];
  searchQuery: string;
  activeFolderId: number | null;
  instanceKey: TMS_INSTANCE_KEY;
  isSearchFilteredLoading: boolean;
  hasSearchFilteredFolders: boolean;
  hasAnyMatch: boolean;
  onFolderClick: (id: number) => void;
  setAllTestCases: VoidFn;
  onToggleFolder: (folder: TransformedFolder) => void;
  pageSearchQuery?: string;
  enableDragAndDrop?: boolean;
  isFlatView?: boolean;
  hideEmptyFoldersInFlatView?: boolean;
  hiddenActiveFolderIndicatorId?: number | null;
  canDropOn?: (draggedItem: TreeDragItem, targetId: string | number) => boolean;
}

export const VirtualFolderTree = ({
  folders,
  expandedIds,
  searchQuery,
  pageSearchQuery,
  activeFolderId,
  instanceKey,
  isSearchFilteredLoading,
  hasSearchFilteredFolders,
  hasAnyMatch,
  enableDragAndDrop = false,
  isFlatView = false,
  hideEmptyFoldersInFlatView = false,
  hiddenActiveFolderIndicatorId = null,
  canDropOn,
  onFolderClick,
  setAllTestCases,
  onToggleFolder,
}: VirtualFolderTreeProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const flatFolders = useFlattenedTree(
    folders,
    expandedIds,
    searchQuery,
    isFlatView,
    hideEmptyFoldersInFlatView,
  );
  const flatFoldersRef = useRef(flatFolders);

  const virtualizer = useVirtualizer({
    count: size(flatFolders),
    overscan: 10,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT_PX,
  });

  flatFoldersRef.current = flatFolders;

  const scrollToActiveFolder = useCallback(
    (folderId: number) => {
      const activeIndex = flatFoldersRef.current.findIndex((node) => node.folder.id === folderId);

      if (activeIndex !== -1) {
        virtualizer.scrollToIndex(activeIndex, { align: 'auto' });
      }
    },
    [virtualizer],
  );

  useEffect(() => {
    if (activeFolderId !== null) {
      scrollToActiveFolder(activeFolderId);
    }
  }, [activeFolderId, scrollToActiveFolder]);

  if (pageSearchQuery && isSearchFilteredLoading) {
    return <BubblesLoader />;
  }

  if ((pageSearchQuery && !hasSearchFilteredFolders) || (searchQuery && !hasAnyMatch)) {
    return <EmptySearchState />;
  }

  const renderRowContent = (
    node: FlatFolderNode,
    nextNodeDepth: number,
    style?: CSSProperties,
    isDragging?: boolean,
    dragRef?: (element: HTMLElement | null) => void,
  ) => (
    <Folder
      node={node}
      activeFolderId={activeFolderId}
      instanceKey={instanceKey}
      onFolderClick={onFolderClick}
      setAllTestCases={setAllTestCases}
      onToggleFolder={onToggleFolder}
      searchQuery={searchQuery}
      nextNodeDepth={nextNodeDepth}
      enableDragAndDrop={enableDragAndDrop}
      hasHiddenActiveDescendant={node.folder.id === hiddenActiveFolderIndicatorId}
      isDragging={isDragging}
      dragRef={dragRef}
      style={style}
    />
  );

  const renderDraggableRow = (
    node: FlatFolderNode,
    nextNodeDepth: number,
    style: CSSProperties,
  ) => (
    <TreeSortableItem
      key={node.folder.id}
      id={node.folder.id}
      index={node.siblingIndex}
      parentId={node.parentId}
      type={FOLDER_DRAG_TYPE}
      hideDefaultPreview
      className={cx('virtual-folder-tree__sortable-item')}
      style={style}
      canDropOn={canDropOn}
      acceptExternalDrop
      externalDropType={EXTERNAL_TREE_DROP_TYPE}
    >
      {({
        isDragging,
        dragRef,
      }: {
        isDragging: boolean;
        dragRef: (element: HTMLElement | null) => void;
      }) => renderRowContent(node, nextNodeDepth, undefined, isDragging, dragRef)}
    </TreeSortableItem>
  );

  return (
    <div ref={scrollRef} className={cx('virtual-folder-tree')}>
      <div
        role="tree"
        className={cx('virtual-folder-tree__list')}
        style={{ height: virtualizer.getTotalSize() }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const folder = flatFolders[virtualRow.index];
          const nextNodeDepth = flatFolders[virtualRow.index + 1]?.depth ?? -1;

          const rowStyle: CSSProperties = {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: virtualRow.size,
            transform: `translateY(${virtualRow.start}px)`,
          };

          return enableDragAndDrop ? (
            renderDraggableRow(folder, nextNodeDepth, rowStyle)
          ) : (
            <Folder
              key={folder.folder.id}
              node={folder}
              activeFolderId={activeFolderId}
              instanceKey={instanceKey}
              onFolderClick={onFolderClick}
              setAllTestCases={setAllTestCases}
              onToggleFolder={onToggleFolder}
              searchQuery={searchQuery}
              nextNodeDepth={nextNodeDepth}
              enableDragAndDrop={enableDragAndDrop}
              hasHiddenActiveDescendant={folder.folder.id === hiddenActiveFolderIndicatorId}
              style={rowStyle}
            />
          );
        })}
      </div>
    </div>
  );
};
