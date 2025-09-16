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
import { useDispatch } from 'react-redux';
import classNames from 'classnames/bind';
import { isEmpty } from 'lodash';
import { ChevronDownDropdownIcon, MeatballMenuIcon } from '@reportportal/ui-kit';

import { TransformedFolder } from 'controllers/testCase';
import { useUserPermissions } from 'hooks/useUserPermissions';
import styles from './folder.scss';
import { PopoverControl } from 'pages/common/popoverControl';
import { useIntl } from 'react-intl';
import { commonMessages } from '../../commonMessages';
import { DELETE_FOLDER_MODAL_KEY } from '../deleteFolderModal';
import { showModalAction } from 'controllers/modal';

const cx = classNames.bind(styles) as typeof classNames;

interface FolderProps {
  folder: TransformedFolder;
  activeFolder: number | null;
  setActiveFolder: (id: number) => void;
  setAllTestCases: () => void;
}

export const Folder = ({ folder, setActiveFolder, setAllTestCases, activeFolder }: FolderProps) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const [isOpen, setIsOpen] = useState(false);
  const [areToolsShown, setAreToolsShown] = useState(false);
  const [areToolsOpen, setAreToolsOpen] = useState(false);
  const [isBlockHovered, setIsBlockHovered] = useState(false);
  const { canDeleteTestCaseFolder } = useUserPermissions();

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

  const openDeleteModal = () => {
    dispatch(
      showModalAction({
        id: DELETE_FOLDER_MODAL_KEY,
        data: {
          folderId: folder.id,
          folderName: folder.name,
          activeFolderId: activeFolder,
          setAllTestCases,
        },
      }),
    );
  };

  const toolItems = canDeleteTestCaseFolder
    ? [
        {
          label: formatMessage(commonMessages.deleteFolder) + '999',
          variant: 'destructive' as const,
          onClick: openDeleteModal,
        },
      ]
    : [];

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
          {!!toolItems.length && (
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
                items={toolItems}
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
            />
          ))}
        </ul>
      )}
    </li>
  );
};
