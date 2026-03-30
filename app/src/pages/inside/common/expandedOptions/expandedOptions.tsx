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

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useDrop } from 'react-dnd';
import { isEmpty } from 'es-toolkit/compat';
import Parser from 'html-react-parser';
import { useSelector } from 'react-redux';
import { BaseIconButton, SearchIcon, FieldText, useTreeDropValidation } from '@reportportal/ui-kit';
import { TreeSortableContainer, DragLayer } from '@reportportal/ui-kit/sortable';
import type { TreeDragItem, TreeDropPosition } from '@reportportal/ui-kit/common';

import { TMS_INSTANCE_KEY } from 'pages/inside/common/constants';
import { createClassnames } from 'common/utils';
import { useStorageFolders } from 'hooks/useStorageFolders';
import { TransformedFolder, foldersSelector } from 'controllers/testCase';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import OutlineSearchIcon from 'common/img/search-outline-icon-inline.svg';
import FilledSearchIcon from 'common/img/search-filled-icon-inline.svg';
import NoResultsIcon from 'common/img/newIcons/no-results-icon-inline.svg';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { messages as testCaseListMessages } from 'pages/inside/common/testCaseList/messages';
import FolderDropIcon from 'common/img/folder-drop-inline.svg';
import { EmptyPageState } from 'pages/common/emptyPageState';

import { messages } from './messages';
import { VirtualFolderTree } from './folderTree/virtualFolderTree';
import type { ExpandedOptionsProps } from './types';
import { useFolderSearch } from './useFolderSearch';
import { useSearchFilteredFolders } from './useSearchFilteredFolders';
import { FOLDER_DRAG_TYPE, EXTERNAL_TREE_DROP_TYPE } from './constants';
import { createTestCaseDropHandler } from './utils';

import styles from './expandedOptions.scss';

const cx = createClassnames(styles);

export const ExpandedOptions = ({
  folders,
  activeFolderId,
  instanceKey,
  children,
  searchQuery: pageSearchQuery,
  searchExtraFilters,
  searchAllFolders,
  searchFilteredData,
  hideFolderSidebar = false,
  setAllTestCases,
  renderCreateFolderButton,
  onFolderClick,
  onMoveFolder,
  onDuplicateFolder,
  onMoveTestCase,
  onDuplicateTestCase,
}: ExpandedOptionsProps) => {
  const { formatMessage } = useIntl();
  const { expandedIds, onToggleFolder } = useStorageFolders(instanceKey);
  const allFolders = useSelector(foldersSelector);

  const internalSearchData = useSearchFilteredFolders({
    searchQuery: searchFilteredData ? undefined : pageSearchQuery,
    extraFilters: searchExtraFilters,
    allFoldersOverride: searchAllFolders,
  });

  const {
    searchFilteredFolders,
    searchFilteredExpandedIds,
    isSearchFilteredLoading,
    hasSearchFilteredFolders,
    handleToggleSearchFilteredFolder,
    filteredTotalTestCases,
  } = searchFilteredData ?? internalSearchData;

  const hasFolderSidebarFilters = useMemo(
    () =>
      Boolean(pageSearchQuery || (searchExtraFilters && !isEmpty(searchExtraFilters))),
    [pageSearchQuery, searchExtraFilters],
  );

  const isDragAndDropEnabled = !!(onMoveFolder && onDuplicateFolder);

  const { canDropOn } = useTreeDropValidation<TransformedFolder>({
    items: folders,
    childrenKey: 'folders',
  });

  const [{ isDraggingAny, isOverFoldersZone }, dropZoneRef] = useDrop(
    () => ({
      accept: [FOLDER_DRAG_TYPE, EXTERNAL_TREE_DROP_TYPE],
      collect: (monitor) => ({
        isDraggingAny: isDragAndDropEnabled ? monitor.canDrop() : false,
        isOverFoldersZone: monitor.isOver(),
      }),
    }),
    [isDragAndDropEnabled],
  );

  const folderSearchSource = hasFolderSidebarFilters ? searchFilteredFolders : folders;
  const folderSearchExpandedIds = hasFolderSidebarFilters
    ? searchFilteredExpandedIds
    : expandedIds;

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
  } = useFolderSearch({
    folders: folderSearchSource,
    expandedIds: folderSearchExpandedIds,
    onToggleFolder: hasFolderSidebarFilters ? handleToggleSearchFilteredFolder : onToggleFolder,
  });

  const allItemsTitle =
    instanceKey === TMS_INSTANCE_KEY.MANUAL_LAUNCH
      ? formatMessage(messages.allTestExecutions)
      : formatMessage(messages.allTestCases);

  const allTestCasesTotal = folders.reduce((total: number, folder: TransformedFolder): number => {
    const countFolderTestCases = (foldersSelector: TransformedFolder): number => {
      return (foldersSelector.folders ?? []).reduce(
        (subTotal: number, subFolder: TransformedFolder): number =>
          subTotal + countFolderTestCases(subFolder),
        foldersSelector.testsCount || 0,
      );
    };

    return total + countFolderTestCases(folder);
  }, 0);

  const totalTestCases = hasFolderSidebarFilters ? filteredTotalTestCases : allTestCasesTotal;

  const [prevHadFolders, setPrevHadFolders] = useState(true);

  useEffect(() => {
    if (hasFolderSidebarFilters && !isSearchFilteredLoading) {
      setPrevHadFolders(hasSearchFilteredFolders);
    }

    if (!hasFolderSidebarFilters) {
      setPrevHadFolders(true);
    }
  }, [hasFolderSidebarFilters, isSearchFilteredLoading, hasSearchFilteredFolders]);

  const hidePageSearchSidebar =
    hasFolderSidebarFilters &&
    !hasSearchFilteredFolders &&
    (!isSearchFilteredLoading || !prevHadFolders);

  const hideSidebar = hidePageSearchSidebar || hideFolderSidebar;

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

  const handleMoveExternal = useCallback(
    (draggedItem: TreeDragItem, targetId: string | number, position: TreeDropPosition) => {
      createTestCaseDropHandler(onMoveTestCase)(draggedItem, targetId, position);
    },
    [onMoveTestCase],
  );

  const handleDuplicateExternal = useCallback(
    (draggedItem: TreeDragItem, targetId: string | number, position: TreeDropPosition) => {
      createTestCaseDropHandler(onDuplicateTestCase)(draggedItem, targetId, position);
    },
    [onDuplicateTestCase],
  );

  const renderContent = () => (
    <>
      {isDragAndDropEnabled && (
        <DragLayer
          type={FOLDER_DRAG_TYPE}
          previewClassName={cx('folder-drag-preview')}
          renderPreview={(item) => {
            const folder = allFolders.find((f) => f.id === item.id);
            return <span>{folder?.name || formatMessage(messages.folder)}</span>;
          }}
        />
      )}
      <div className={cx('expanded-options')}>
        {hideSidebar || (
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
              ref={dropZoneRef}
              className={cx('expanded-options__sidebar-folders-wrapper', {
                'expanded-options__sidebar-folders-wrapper--with-search': isSearchVisible,
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
              <VirtualFolderTree
                folders={filteredFolders}
                expandedIds={effectiveExpandedIds}
                searchQuery={searchQuery}
                pageSearchQuery={pageSearchQuery}
                activeFolderId={activeFolderId}
                instanceKey={instanceKey}
                isSearchFilteredLoading={isSearchFilteredLoading}
                hasSearchFilteredFolders={hasSearchFilteredFolders}
                hasAnyMatch={hasAnyMatch}
                enableDragAndDrop={isDragAndDropEnabled}
                canDropOn={isDragAndDropEnabled ? canDropOn : undefined}
                setAllTestCases={setAllTestCases}
                onToggleFolder={handleToggleFolder}
                onFolderClick={onFolderClick}
              />
            </div>
          </div>
        )}
        {hidePageSearchSidebar ? (
          <div className={cx('expanded-options__content')}>
            <div className={cx('expanded-options__no-search-results')}>
              <EmptyPageState
                label={formatMessage(COMMON_LOCALE_KEYS.NO_RESULTS)}
                description={formatMessage(testCaseListMessages.noResultsDescription)}
                emptyIcon={NoResultsIcon}
              />
            </div>
          </div>
        ) : (
          <ScrollWrapper>
            <div className={cx('expanded-options__content')}>{children}</div>
          </ScrollWrapper>
        )}
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
      onMoveExternal={handleMoveExternal}
      onDuplicateExternal={handleDuplicateExternal}
    >
      {renderContent()}
    </TreeSortableContainer>
  ) : (
    renderContent()
  );
};
