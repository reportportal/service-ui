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

import { useState, useCallback, MouseEvent as ReactMouseEvent, useEffect, FC } from 'react';
import { isEmpty } from 'es-toolkit/compat';
import { ChevronDownDropdownIcon, MeatballMenuIcon } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { PopoverControl } from 'pages/common/popoverControl';

import { highlightText, hasMatchInTree, hasChildMatch } from '../utils';
import { FolderProps } from './types';
import { useFolderTooltipItems } from './useFolderTooltipItems';
import { FolderWrapper } from './folderWrapper';
import { FolderSubfolders } from './folderSubfolders';

import styles from './folder.scss';

const cx = createClassnames(styles);

interface FolderComposite extends FC<FolderProps> {
  Wrapper: typeof FolderWrapper;
  Subfolders: typeof FolderSubfolders;
}

export const Folder: FolderComposite = ({
  folder,
  activeFolder,
  instanceKey,
  expandedIds,
  onFolderClick,
  setAllTestCases,
  onToggleFolder,
  searchQuery = '',
  ancestorDirectMatch = false,
}: FolderProps) => {
  const isOpen = expandedIds.includes(folder.id);
  const [areToolsShown, setAreToolsShown] = useState(false);
  const [areToolsOpen, setAreToolsOpen] = useState(false);
  const [isBlockHovered, setIsBlockHovered] = useState(false);

  const isDirectMatch = searchQuery
    ? folder.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
    : false;

  const childrenMatch = searchQuery ? hasChildMatch(folder, searchQuery) : false;

  const hasIndirectMatch = searchQuery && !isDirectMatch && (childrenMatch || ancestorDirectMatch);

  const tooltipItems = useFolderTooltipItems({
    folder,
    activeFolder,
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
    <Folder.Wrapper isOpen={isOpen} ariaSelected={activeFolder === folder.id}>
      <div className={cx('folders-tree__item-content')}>
        {!isEmpty(folder.folders) && <ChevronDownDropdownIcon onClick={handleChevronClick} />}
        <div
          className={cx('folders-tree__item-title', {
            'folders-tree__item-title--active': activeFolder === folder.id,
            'folders-tree__item-title--dimmed': hasIndirectMatch,
          })}
          onClick={handleFolderTitleClick}
          onFocus={() => setIsBlockHovered(true)}
          onBlur={() => setIsBlockHovered(false)}
          onMouseEnter={() => setIsBlockHovered(true)}
          onMouseLeave={() => setIsBlockHovered(false)}
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
      <Folder.Subfolders shouldDisplay={isOpen && !isEmpty(folder.folders)}>
        {folder.folders?.map((subfolder) => {
          const shouldShow =
            !searchQuery ||
            isDirectMatch ||
            ancestorDirectMatch ||
            hasMatchInTree(subfolder, searchQuery);

          if (!shouldShow) return null;

          return (
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
              ancestorDirectMatch={isDirectMatch || ancestorDirectMatch}
            />
          );
        })}
      </Folder.Subfolders>
    </Folder.Wrapper>
  );
};

Folder.Wrapper = FolderWrapper;
Folder.Subfolders = FolderSubfolders;
