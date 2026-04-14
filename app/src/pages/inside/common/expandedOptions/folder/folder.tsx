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

import {
  useState,
  useCallback,
  MouseEvent as ReactMouseEvent,
  useEffect,
  CSSProperties,
} from 'react';
import { useIntl } from 'react-intl';
import { isEmpty } from 'es-toolkit/compat';
import { ChevronDownDropdownIcon, MeatballMenuIcon, DragNDropIcon } from '@reportportal/ui-kit';
import { VoidFn } from '@reportportal/ui-kit/common';

import { isEnterOrSpaceKey } from 'common/utils/helperUtils/eventUtils';
import { createClassnames } from 'common/utils';
import { TransformedFolder } from 'controllers/testCase';
import { TMS_INSTANCE_KEY } from 'pages/inside/common/constants';

import { PopoverControl } from 'pages/common/popoverControl';
import { highlightText, hasChildMatch } from '../utils';
import { messages } from '../messages';
import { useFolderTooltipItems } from './useFolderTooltipItems';
import { ConnectorLines, INDENT_PX } from './connectorLines';

import type { FlatFolderNode } from '../useFlattenedTree';
import styles from './folder.scss';

const cx = createClassnames(styles);

interface FolderRowProps {
  node: FlatFolderNode;
  activeFolderId: number | null;
  instanceKey: TMS_INSTANCE_KEY;
  searchQuery: string;
  nextNodeDepth: number;
  enableDragAndDrop?: boolean;
  isDragging?: boolean;
  dragRef?: (element: HTMLElement | null) => void;
  style?: CSSProperties;
  onToggleFolder: (folder: TransformedFolder) => void;
  onFolderClick: (id: number) => void;
  setAllTestCases: VoidFn;
}

export const Folder = ({
  node,
  activeFolderId,
  instanceKey,
  searchQuery,
  nextNodeDepth,
  enableDragAndDrop = false,
  isDragging: isDraggingFolder = false,
  dragRef,
  style,
  onFolderClick,
  setAllTestCases,
  onToggleFolder,
}: FolderRowProps) => {
  const { formatMessage } = useIntl();
  const {
    folder,
    depth,
    hasChildren,
    isOpen,
    isDirectMatch,
    hasAncestorDirectMatch,
    connectorDepths,
    isLastChild,
  } = node;

  const [areToolsShown, setAreToolsShown] = useState(false);
  const [areToolsOpen, setAreToolsOpen] = useState(false);
  const [isBlockHovered, setIsBlockHovered] = useState(false);
  const [showDragIcon, setShowDragIcon] = useState(false);

  const childrenMatch = searchQuery ? hasChildMatch(folder, searchQuery) : false;
  const hasIndirectMatch =
    searchQuery && !isDirectMatch && (childrenMatch || hasAncestorDirectMatch);

  const tooltipItems = useFolderTooltipItems({
    folder,
    activeFolder: activeFolderId,
    setAllTestCases,
    instanceKey,
  });

  useEffect(() => {
    setAreToolsShown(areToolsOpen || isBlockHovered);
  }, [areToolsOpen, isBlockHovered]);

  const handleChevronClick = useCallback(
    (event: ReactMouseEvent<SVGSVGElement, MouseEvent>) => {
      event.stopPropagation();

      onToggleFolder(folder);
    },
    [folder, onToggleFolder],
  );

  const handleFolderTitleClick = useCallback(
    (event: ReactMouseEvent<HTMLDivElement, MouseEvent>) => {
      event.stopPropagation();

      onFolderClick(folder.id);
    },
    [folder.id, onFolderClick],
  );

  return (
    <div
      className={cx('folders-tree__item', {
        'folders-tree__item--open': isOpen,
      })}
      role="treeitem"
      tabIndex={0}
      aria-level={depth + 1}
      aria-expanded={hasChildren ? isOpen : undefined}
      aria-selected={activeFolderId === folder.id}
      style={{ ...style, paddingLeft: depth * INDENT_PX }}
    >
      <ConnectorLines
        depth={depth}
        connectorDepths={connectorDepths}
        nextRowDepth={nextNodeDepth}
        isLastChild={isLastChild}
      />
      <div className={cx('folders-tree__item-content')}>
        {hasChildren && <ChevronDownDropdownIcon onClick={handleChevronClick} />}
        <div
          className={cx('folders-tree__item-title', {
            'folders-tree__item-title--active': activeFolderId === folder.id,
            'folders-tree__item-title--dimmed': hasIndirectMatch,
          })}
          onClick={handleFolderTitleClick}
          onFocus={() => setIsBlockHovered(true)}
          onBlur={() => setIsBlockHovered(false)}
          onMouseEnter={() => {
            setIsBlockHovered(true);
            setShowDragIcon(true);
          }}
          onMouseLeave={() => {
            setIsBlockHovered(false);
            setShowDragIcon(false);
          }}
        >
          <span className={cx('folders-tree__item-title--text')} title={folder.name}>
            {isDirectMatch ? highlightText(folder.name, searchQuery) : folder.name}
          </span>
          {!isEmpty(tooltipItems) && (
            <button
              className={cx('folders-tree__tools', {
                'folders-tree__tools--shown': areToolsShown,
              })}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setAreToolsOpen(true);
              }}
            >
              <PopoverControl
                items={tooltipItems}
                isOpened={areToolsOpen}
                setIsOpened={setAreToolsOpen}
                placement="bottom-end"
                strategy="fixed"
                shouldUsePortal
              >
                <div
                  className={cx('folders-tree__meatball', {
                    'folders-tree__meatball--active': areToolsOpen,
                  })}
                >
                  <MeatballMenuIcon />
                </div>
              </PopoverControl>
            </button>
          )}
          {enableDragAndDrop && (showDragIcon || isDraggingFolder) ? (
            <button
              ref={dragRef}
              type="button"
              className={cx('folders-tree__drag-handle')}
              aria-label={formatMessage(messages.dragToReorder)}
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => {
                if (isEnterOrSpaceKey(event)) {
                  event.stopPropagation();
                }
              }}
            >
              <DragNDropIcon />
            </button>
          ) : (
            <span className={cx('folders-tree__item-title--counter')}>
              {folder.testsCount || 0}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
