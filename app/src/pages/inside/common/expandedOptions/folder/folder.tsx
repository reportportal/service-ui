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

import { useState, useCallback, MouseEvent as ReactMouseEvent, useEffect } from 'react';
import classNames from 'classnames/bind';
import { isEmpty } from 'es-toolkit/compat';
import { ChevronDownDropdownIcon, MeatballMenuIcon } from '@reportportal/ui-kit';

import { PopoverControl } from 'pages/common/popoverControl';
import { TransformedFolder } from 'controllers/testCase';

import { INSTANCE_KEYS, useFolderTooltipItems } from './useFolderTooltipItems';

import styles from './folder.scss';

const cx = classNames.bind(styles) as typeof classNames;

interface FolderProps {
  folder: TransformedFolder;
  activeFolder: number | null;
  setActiveFolder: (id: number) => void;
  setAllTestCases: () => void;
  instanceKey: INSTANCE_KEYS;
}

export const Folder = ({
  folder,
  setActiveFolder,
  setAllTestCases,
  activeFolder,
  instanceKey,
}: FolderProps) => {
  const [isOpen, setIsOpen] = useState(false);
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
          })}
          onClick={handleFolderTitleClick}
          onFocus={() => setIsBlockHovered(true)}
          onBlur={() => setIsBlockHovered(false)}
          onMouseEnter={() => setIsBlockHovered(true)}
          onMouseLeave={() => setIsBlockHovered(false)}
        >
          <span className={cx('folders-tree__item-title--text')} title={folder.name}>
            {folder.name}
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
          {folder.folders?.map((subfolder) => (
            <Folder
              folder={subfolder}
              key={subfolder.id}
              activeFolder={activeFolder}
              setActiveFolder={setActiveFolder}
              setAllTestCases={setAllTestCases}
              instanceKey={instanceKey}
            />
          ))}
        </ul>
      )}
    </li>
  );
};
