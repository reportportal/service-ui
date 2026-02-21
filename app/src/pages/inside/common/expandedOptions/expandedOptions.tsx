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

import { useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useDrop } from 'react-dnd';
import Parser from 'html-react-parser';
import {
  BaseIconButton,
  SearchIcon,
  FieldText,
  DragNDropIcon,
  useTreeDropValidation,
} from '@reportportal/ui-kit';
import { TreeSortableContainer, DragLayer } from '@reportportal/ui-kit/sortable';
import type { TreeDragItem, TreeDropPosition } from '@reportportal/ui-kit/common';
import { useSelector } from 'react-redux';

import { TMS_INSTANCE_KEY } from 'pages/inside/common/constants';
import { createClassnames } from 'common/utils';
import { useStorageFolders } from 'hooks/useStorageFolders';
import { TransformedFolder, foldersSelector } from 'controllers/testCase';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { EmptySearchState } from 'pages/common/emptySearchState';
import OutlineSearchIcon from 'common/img/search-outline-icon-inline.svg';
import FilledSearchIcon from 'common/img/search-filled-icon-inline.svg';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import FolderDropIcon from 'common/img/folder-drop-inline.svg';

import { Folder } from './folder';
import { messages } from './messages';
import { ExpandedOptionsProps } from './types';
import { useFolderSearch } from './useFolderSearch';
import { FOLDER_DRAG_TYPE } from './constants';

import styles from './expandedOptions.scss';

const cx = createClassnames(styles);

export const ExpandedOptions = ({
  folders,
  activeFolderId,
  instanceKey,
  children,
  setAllTestCases,
  renderCreateFolderButton,
  onFolderClick,
  onMoveFolder,
  onDuplicateFolder,
}: ExpandedOptionsProps) => {
  const { formatMessage } = useIntl();
  const { expandedIds, onToggleFolder } = useStorageFolders(instanceKey);
  const allFolders = useSelector(foldersSelector);

  const isDragAndDropEnabled = !!(onMoveFolder && onDuplicateFolder);

  const dropValidation = (
    useTreeDropValidation as (params: { items: TransformedFolder[]; childrenKey: string }) => {
      canDropOn: (draggedItem: { id: string | number }, targetId: string | number) => boolean;
    }
  )({
    items: folders,
    childrenKey: 'folders',
  });
  const canDropOn = dropValidation.canDropOn;

  const [{ isDraggingAny, isOverFoldersZone }, dropZoneRef] = useDrop(
    () => ({
      accept: FOLDER_DRAG_TYPE,
      collect: (monitor) => ({
        isDraggingAny: isDragAndDropEnabled ? monitor.canDrop() : false,
        isOverFoldersZone: monitor.isOver(),
      }),
    }),
    [isDragAndDropEnabled],
  );

  const {
    searchQuery,
    isSearchVisible,
    searchInputRef,
    searchWrapperRef,
    filteredFolders,
    hasAnyMatch,
    effectiveExpandedIds,
    handleToggleFolder,
    handleSearchChange,
    handleSearchClear,
    handleMagnifierClick,
  } = useFolderSearch({ folders, expandedIds, onToggleFolder });

  const allItemsTitle =
    instanceKey === TMS_INSTANCE_KEY.MANUAL_LAUNCH
      ? formatMessage(messages.allTestExecutions)
      : formatMessage(messages.allTestCases);

  const totalTestCases = folders.reduce((total: number, folder: TransformedFolder): number => {
    const countFolderTestCases = (folder: TransformedFolder): number => {
      return (folder.folders ?? []).reduce(
        (subTotal: number, subFolder: TransformedFolder): number =>
          subTotal + countFolderTestCases(subFolder),
        folder.testsCount || 0,
      );
    };

    return total + countFolderTestCases(folder);
  }, 0);

  const handleMoveFolder = useCallback(
    (draggedItem: TreeDragItem, targetId: string | number, position: TreeDropPosition) => {
      onMoveFolder?.(draggedItem, targetId, position);
    },
    [onMoveFolder],
  );

  const handleDuplicateFolder = useCallback(
    (draggedItem: TreeDragItem, targetId: string | number, position: TreeDropPosition) => {
      onDuplicateFolder?.(draggedItem, targetId, position);
    },
    [onDuplicateFolder],
  );

  const renderContent = () => (
    <>
      {isDragAndDropEnabled && (
        <DragLayer
          type={FOLDER_DRAG_TYPE}
          previewClassName={cx('folder-drag-preview')}
          renderPreview={(item) => {
            const folder = allFolders.find((f) => f.id === item.id);
            return (
              <>
                <span>{folder?.name || formatMessage(messages.folder)}</span>
                <DragNDropIcon />
              </>
            );
          }}
        />
      )}
      <div className={cx('expanded-options')}>
        <div className={cx('expanded-options__sidebar')}>
          <div className={cx('sidebar-header')}>
            <button
              type="button"
              className={cx('sidebar-header__title', {
                'sidebar-header__title--active': activeFolderId === null,
              })}
              onClick={setAllTestCases}
            >
              <span className={cx('sidebar-header__title--text')}>{allItemsTitle}</span>
              <span className={cx('sidebar-header__title--counter')}>
                {totalTestCases.toLocaleString()}
              </span>
            </button>
          </div>
          <div className={cx('expanded-options__sidebar-separator')} />
          <div className={cx('expanded-options__sidebar-actions')}>
            <div className={cx('expanded-options__sidebar-actions--title')} id="tree_label">
              {formatMessage(messages.folders)}
            </div>
            <BaseIconButton
              className={cx('expanded-options__sidebar-actions--search', {
                'expanded-options__sidebar-actions--search-panel-open': isSearchVisible,
                'expanded-options__sidebar-actions--search-has-query': !!searchQuery,
              })}
              onClick={handleMagnifierClick}
            >
              {searchQuery ? Parser(String(FilledSearchIcon)) : Parser(String(OutlineSearchIcon))}
            </BaseIconButton>
            {renderCreateFolderButton?.()}
          </div>
          {isSearchVisible && (
            <div ref={searchWrapperRef} className={cx('expanded-options__search-wrapper')}>
              <FieldText
                ref={searchInputRef}
                value={searchQuery}
                onChange={handleSearchChange}
                onClear={handleSearchClear}
                placeholder={formatMessage(messages.searchPlaceholder)}
                defaultWidth={false}
                clearable
                startIcon={<SearchIcon />}
              />
            </div>
          )}
          <div
            className={cx('expanded-options__sidebar-folders-wrapper', {
              'expanded-options__sidebar-folders-wrapper--with-search': isSearchVisible,
            })}
          >
            <ScrollWrapper className={cx('expanded-options__scroll-wrapper-background')}>
              <div
                ref={dropZoneRef}
                className={cx('expanded-options__sidebar-folders', {
                  'expanded-options__sidebar-folders--dragging': isDraggingAny,
                })}
              >
                {isDraggingAny && !isOverFoldersZone && (
                  <div className={cx('expanded-options__drop-placeholder')}>
                    <div className={cx('expanded-options__drop-placeholder-content')}>
                      <i className={cx('expanded-options__drop-placeholder-icon')}>
                        {Parser(FolderDropIcon)}
                      </i>
                      <span className={cx('expanded-options__drop-placeholder-text')}>
                        {formatMessage({
                          id: 'expandedOptions.dropPlaceholder',
                          defaultMessage: 'Drop items here to move them into a folder',
                        })}
                      </span>
                    </div>
                  </div>
                )}
                <ul
                  className={cx('folders-tree', 'folders-tree--outer')}
                  role="tree"
                  aria-labelledby="tree_label"
                >
                  {!searchQuery || hasAnyMatch ? (
                    filteredFolders.map((folder, idx) => (
                      <Folder
                        folder={folder}
                        key={folder.id || `${folder.name}-${idx}`}
                        activeFolder={activeFolderId}
                        instanceKey={instanceKey}
                        expandedIds={effectiveExpandedIds}
                        onFolderClick={onFolderClick}
                        setAllTestCases={setAllTestCases}
                        onToggleFolder={handleToggleFolder}
                        searchQuery={searchQuery}
                        index={idx}
                        parentId={null}
                        enableDragAndDrop={isDragAndDropEnabled}
                        canDropOn={canDropOn}
                      />
                    ))
                  ) : (
                    <EmptySearchState />
                  )}
                </ul>
              </div>
            </ScrollWrapper>
          </div>
        </div>
        <ScrollWrapper>
          <div className={cx('expanded-options__content')}>{children}</div>
        </ScrollWrapper>
      </div>
    </>
  );

  return isDragAndDropEnabled ? (
    <TreeSortableContainer
      showDropConfirmation
      confirmationLabels={{
        move: formatMessage(COMMON_LOCALE_KEYS.MOVE),
        duplicate: formatMessage({ id: 'expandedOptions.duplicate', defaultMessage: 'Duplicate' }),
        cancel: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      }}
      onMove={handleMoveFolder}
      onDuplicate={handleDuplicateFolder}
    >
      {renderContent()}
    </TreeSortableContainer>
  ) : (
    renderContent()
  );
};
