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

import {
  useState,
  useCallback,
  MouseEvent as ReactMouseEvent,
  KeyboardEvent,
  useEffect,
  ReactNode,
} from 'react';
import { isEmpty } from 'es-toolkit/compat';
import { ChevronDownDropdownIcon, MeatballMenuIcon } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { isEnterOrSpaceKey } from 'common/utils/helperUtils/eventUtils';
import { PopoverControl } from 'pages/common/popoverControl';
import { TransformedFolder } from 'controllers/testCase';

import { INSTANCE_KEYS, useFolderTooltipItems } from './useFolderTooltipItems';

import styles from './folder.scss';

const cx = createClassnames(styles);

/**
 * Escapes special regex characters in a string
 */
const escapeRegExp = (str: string): string => {
  let result = '';

  for (const char of str) {
    if ('.*+?^${}()|[]\\'.includes(char)) {
      result += `\\${char}`;
    } else {
      result += char;
    }
  }

  return result;
};

/**
 * Highlight matching text in search results
 */
const highlightText = (text: string, query: string): ReactNode => {
  if (!query) return text;

  const escapedQuery = escapeRegExp(query);
  const regex = new RegExp(escapedQuery, 'gi');
  let lastIndex = 0;
  const result: ReactNode[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index));
    }

    result.push(
      <span key={`highlight-${match.index}`} className={cx('highlight')}>
        {match[0]}
      </span>,
    );
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return <>{result}</>;
};

interface FolderProps {
  folder: TransformedFolder;
  activeFolder: number | null;
  setActiveFolder: (id: number) => void;
  setAllTestCases: () => void;
  instanceKey: INSTANCE_KEYS;
  searchQuery?: string;
}

export const Folder = ({
  folder,
  setActiveFolder,
  setAllTestCases,
  activeFolder,
  instanceKey,
  searchQuery = '',
}: FolderProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const folderNameMatchesQuery = searchQuery
    ? folder.name.toLowerCase().includes(searchQuery.toLowerCase())
    : true;
  const [areToolsShown, setAreToolsShown] = useState(false);
  const [areToolsOpen, setAreToolsOpen] = useState(false);
  const [isBlockHovered, setIsBlockHovered] = useState(false);
  const tooltipItems = useFolderTooltipItems({
    folder,
    activeFolder,
    setAllTestCases,
    instanceKey,
  });

  useEffect(() => {
    setAreToolsShown(areToolsOpen || isBlockHovered);
  }, [areToolsOpen, isBlockHovered]);

  // Auto-expand folders when search query is present and folder has children
  useEffect(() => {
    if (searchQuery && !isEmpty(folder.folders)) {
      setIsOpen(true);
    }
  }, [searchQuery, folder.folders]);

  const handleChevronClick = useCallback((event: ReactMouseEvent<SVGSVGElement, MouseEvent>) => {
    event.stopPropagation();
    setIsOpen((prevState) => !prevState);
  }, []);

  const handleFolderTitleClick = useCallback(
    (event: ReactMouseEvent<HTMLDivElement, MouseEvent>) => {
      event.stopPropagation();
      setActiveFolder(folder.id);
    },
    [setActiveFolder, folder.id],
  );

  const handleFolderTitleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (
        isEnterOrSpaceKey(event) ||
        event.key === 'ArrowRight' ||
        event.key === 'ArrowLeft' ||
        event.key === 'ArrowUp' ||
        event.key === 'ArrowDown'
      ) {
        event.preventDefault();
        event.stopPropagation();
      }

      if (isEnterOrSpaceKey(event)) {
        setActiveFolder(folder.id);
        return;
      }

      if (event.key === 'ArrowRight' && !isEmpty(folder.folders) && !isOpen) {
        setIsOpen(true);
        return;
      }

      if (event.key === 'ArrowLeft' && isOpen) {
        setIsOpen(false);
      }
    },
    [setActiveFolder, folder.id, folder.folders, isOpen],
  );

  const handleBlockHoverStart = useCallback(() => {
    setIsBlockHovered(true);
  }, []);

  const handleBlockHoverEnd = useCallback(() => {
    setIsBlockHovered(false);
  }, []);

  const handleToolsClick = useCallback((event: ReactMouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault();
    event.stopPropagation();
    setAreToolsOpen(true);
  }, []);

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
            'folders-tree__item-title--dimmed': searchQuery && !folderNameMatchesQuery,
          })}
          role="button"
          tabIndex={0}
          onClick={handleFolderTitleClick}
          onKeyDown={handleFolderTitleKeyDown}
          onFocus={handleBlockHoverStart}
          onBlur={handleBlockHoverEnd}
          onMouseEnter={handleBlockHoverStart}
          onMouseLeave={handleBlockHoverEnd}
        >
          <span className={cx('folders-tree__item-title--text')} title={folder.name}>
            {highlightText(folder.name, searchQuery)}
          </span>
          {!isEmpty(tooltipItems) && (
            <button
              className={cx('folders-tree__tools', {
                'folders-tree__tools--shown': areToolsShown,
              })}
              onClick={handleToolsClick}
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
          {folder.folders?.map((subfolder) => (
            <Folder
              folder={subfolder}
              key={subfolder.id}
              activeFolder={activeFolder}
              setActiveFolder={setActiveFolder}
              setAllTestCases={setAllTestCases}
              instanceKey={instanceKey}
              searchQuery={searchQuery}
            />
          ))}
        </ul>
      )}
    </li>
  );
};
