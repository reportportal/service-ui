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

import { useState, useCallback, MouseEvent as ReactMouseEvent } from 'react';
import classNames from 'classnames/bind';
import { isEmpty } from 'lodash';
import { ChevronDownDropdownIcon } from '@reportportal/ui-kit';

import styles from './folder.scss';

const cx = classNames.bind(styles) as typeof classNames;

type Folder = {
  name: string;
  countOfTestCases?: number;
  subFolders?: Folder[];
  id: number;
};

interface FolderProps {
  folder: Folder;
  activeFolder: number | null;
  setActiveFolder: (name: string) => void;
  setIsEmptyFolder: (count: boolean) => void;
}

export const Folder = ({
  folder,
  setActiveFolder,
  activeFolder,
  setIsEmptyFolder,
}: FolderProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = useCallback(
    ({
      event,
      id,
      count,
    }: {
      event: ReactMouseEvent<HTMLDivElement, MouseEvent>;
      id: number;
      count?: number;
    }) => {
      event.stopPropagation();

      setIsOpen((prevState) => !prevState);
      setActiveFolder(id);
      setIsEmptyFolder(!count);
    },
    [setActiveFolder, setIsEmptyFolder],
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
      <div
        onClick={(event) => handleOpen({ event, id: folder.id, count: folder.countOfTestCases })}
      >
        {!isEmpty(folder.subFolders) && <ChevronDownDropdownIcon />}
        <div
          className={cx('folders-tree__item-title', {
            'folders-tree__item-title--active': activeFolder === folder.id,
          })}
        >
          <span className={cx('folders-tree__item-title--text')} title={folder.name}>
            {folder.name}
          </span>
          <span className={cx('folders-tree__item-title--counter')}>
            {folder.countOfTestCases || 0}
          </span>
        </div>
      </div>

      {isOpen && !isEmpty(folder.subFolders) && (
        <ul className={cx('folders-tree', 'folders-tree--inner')} role="group">
          {folder.subFolders?.map((subfolder) => (
            <Folder
              folder={subfolder}
              key={subfolder.name}
              activeFolder={activeFolder}
              setActiveFolder={setActiveFolder}
              setIsEmptyFolder={setIsEmptyFolder}
            />
          ))}
        </ul>
      )}
    </li>
  );
};
