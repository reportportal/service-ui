/*
 * Copyright 2025 EPAM Systems
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

import { useState, useCallback, MouseEvent as ReactMouseEvent, useEffect, ReactNode } from 'react';
import { isEmpty } from 'es-toolkit/compat';
import { ChevronDownDropdownIcon, MeatballMenuIcon } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { TMS_INSTANCE_KEY } from 'pages/inside/common/constants';
import { PopoverControl } from 'pages/common/popoverControl';
import { TransformedFolder } from 'controllers/testCase';

import { useFolderTooltipItems } from './useFolderTooltipItems';

import styles from './folder.scss';

const cx = createClassnames(styles);

/**
 * Highlights matching text in folder names
 * Wraps matching text with a highlight span
 */
const highlightText = (text: string, query: string): ReactNode => {
  if (!query || !text) return text;

  const trimmedQuery = query.trim();
  if (!trimmedQuery) return text;

  const escapedQuery = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escapedQuery, 'gi');

  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // Reset regex lastIndex to ensure clean state
  regex.lastIndex = 0;

  while ((match = regex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    // Add matched text with highlight
    parts.push(
      <span key={`highlight-${match.index}`} className={cx('highlight')}>
        {match[0]}
      </span>,
    );
    lastIndex = regex.lastIndex;

    // Prevent infinite loop on zero-width matches
    if (match.index === regex.lastIndex) {
      regex.lastIndex += 1;
    }
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? <>{parts}</> : text;
};

/**
 * Recursively checks if a folder or any of its descendants match the search query
 */
const hasMatchInTree = (folder: TransformedFolder, query: string): boolean => {
  if (!query) return true;

  const lowerQuery = query.toLowerCase().trim();
  if (folder.name.toLowerCase().includes(lowerQuery)) {
    return true;
  }

  return (folder.folders ?? []).some((child) => hasMatchInTree(child, lowerQuery));
};

interface FolderProps {
  folder: TransformedFolder;
  activeFolder: number | null;
  instanceKey: TMS_INSTANCE_KEY;
  expandedIds: number[];
  setAllTestCases: () => void;
  onFolderClick: (id: number) => void;
  onToggleFolder: (folder: TransformedFolder) => void;
  searchQuery?: string;
}

export const Folder = ({
  folder,
  activeFolder,
  instanceKey,
  expandedIds,
  onFolderClick,
  setAllTestCases,
  onToggleFolder,
  searchQuery = '',
}: FolderProps) => {
  const isOpen = expandedIds.includes(folder.id);
  const [areToolsShown, setAreToolsShown] = useState(false);
  const [areToolsOpen, setAreToolsOpen] = useState(false);
  const [isBlockHovered, setIsBlockHovered] = useState(false);

  // Check if this folder or any descendant matches (determines visibility in tree)
  const hasMatchInSubtree = hasMatchInTree(folder, searchQuery);

  // Check if THIS folder name directly matches the search query
  const isDirectMatch = searchQuery
    ? folder.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
    : true;

  const tooltipItems = useFolderTooltipItems({
    folder,
    activeFolder,
    setAllTestCases,
    instanceKey,
  });

  useEffect(() => {
    setAreToolsShown(areToolsOpen || isBlockHovered);
  }, [areToolsOpen, isBlockHovered]);

  // Auto-expand folders when searching if they have children and are relevant
  // Only expand if this folder doesn't match directly but has matching descendants
  useEffect(() => {
    if (searchQuery && !isEmpty(folder.folders) && hasMatchInSubtree && !isDirectMatch && !isOpen) {
      onToggleFolder(folder);
    }
  }, [searchQuery, folder, hasMatchInSubtree, isDirectMatch, isOpen, onToggleFolder]);

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
    <li
      className={cx('folders-tree__item', {
        'folders-tree__item--open': isOpen,
      })}
      role="treeitem"
      aria-expanded={isOpen}
      aria-selected={activeFolder === folder.id}
    >
      <div className={cx('folders-tree__item-content')}>
        {!isEmpty(folder.folders) && <ChevronDownDropdownIcon onClick={handleChevronClick} />}
        <div
          className={cx('folders-tree__item-title', {
            'folders-tree__item-title--active': activeFolder === folder.id,
            'folders-tree__item-title--dimmed': searchQuery && !isDirectMatch,
          })}
          onClick={handleFolderTitleClick}
          onFocus={() => setIsBlockHovered(true)}
          onBlur={() => setIsBlockHovered(false)}
          onMouseEnter={() => setIsBlockHovered(true)}
          onMouseLeave={() => setIsBlockHovered(false)}
        >
          <span className={cx('folders-tree__item-title--text')} title={folder.name}>
            {highlightText(folder.name, searchQuery)}
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
          <span className={cx('folders-tree__item-title--counter')}>{folder.testsCount || 0}</span>
        </div>
      </div>

      {isOpen && !isEmpty(folder.folders) && (
        <ul className={cx('folders-tree', 'folders-tree--inner')} role="group">
          {folder.folders
            ?.filter((subfolder) => !searchQuery || hasMatchInTree(subfolder, searchQuery))
            .map((subfolder) => (
              <Folder
                folder={subfolder}
                key={subfolder.id}
                activeFolder={activeFolder}
                instanceKey={instanceKey}
                expandedIds={expandedIds}
                onFolderClick={onFolderClick}
                setAllTestCases={setAllTestCases}
                onToggleFolder={onToggleFolder}
                searchQuery={searchQuery}
              />
            ))}
        </ul>
      )}
    </li>
  );
};
