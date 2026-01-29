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

import { ReactNode, useCallback } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useDrop } from 'react-dnd';
import {
  BaseIconButton,
  SearchIcon,
  DragNDropIcon,
  useTreeDropValidation,
} from '@reportportal/ui-kit';
import { TreeSortableContainer, DragLayer } from '@reportportal/ui-kit/sortable';
import type { TreeDragItem, TreeDropPosition } from '@reportportal/ui-kit/common';
import { useSelector } from 'react-redux';

import { TMS_INSTANCE_KEY } from 'pages/inside/common/constants';
import { createClassnames } from 'common/utils';
import { useStorageFolders } from 'hooks/useStorageFolders';
import { TransformedFolder } from 'controllers/testCase';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { foldersSelector } from 'controllers/testCase';

import { Folder } from './folder';

import styles from './expandedOptions.scss';

const FOLDER_DRAG_TYPE = 'TEST_CASE_FOLDER';

const cx = createClassnames(styles);

const messages = defineMessages({
  allTestCases: {
    id: 'expandedOptions.allTestCases',
    defaultMessage: 'All Test Cases',
  },
  folders: {
    id: 'expandedOptions.folders',
    defaultMessage: 'Folders',
  },
});

interface ExpandedOptionsProps {
  folders: TransformedFolder[];
  activeFolderId: number | null;
  setAllTestCases: () => void;
  onFolderClick: (id: number) => void;
  children: ReactNode;
  instanceKey?: TMS_INSTANCE_KEY;
  renderCreateFolderButton?: () => ReactNode;
  onMoveFolder?: (
    draggedItem: TreeDragItem,
    targetId: string | number,
    position: TreeDropPosition,
  ) => void;
  onDuplicateFolder?: (
    draggedItem: TreeDragItem,
    targetId: string | number,
    position: TreeDropPosition,
  ) => void;
}

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

  // Only enable drag and drop if handlers are provided
  const isDragAndDropEnabled = !!(onMoveFolder || onDuplicateFolder);

  // Use the hook from ui-kit to validate drop targets
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
                <span>{folder?.name || 'Folder'}</span>
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
              <span className={cx('sidebar-header__title--text')}>
                {formatMessage(messages.allTestCases)}
              </span>
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
            <BaseIconButton className={cx('expanded-options__sidebar-actions--search')}>
              <SearchIcon />
            </BaseIconButton>
            {renderCreateFolderButton?.()}
          </div>
          <div className={cx('expanded-options__sidebar-folders-wrapper')}>
            <ScrollWrapper className={cx('expanded-options__scroll-wrapper-background')}>
              <div
                ref={dropZoneRef}
                className={cx('expanded-options__sidebar-folders', {
                  'expanded-options__sidebar-folders--dragging': isDraggingAny,
                })}
              >
                {isDraggingAny && !isOverFoldersZone && (
                  <div className={cx('expanded-options__drop-placeholder')}>
                    <span className={cx('expanded-options__drop-placeholder-text')}>
                      {formatMessage({
                        id: 'expandedOptions.dropPlaceholder',
                        defaultMessage: 'Drop items here to move them into a folder',
                      })}
                    </span>
                  </div>
                )}
                <ul
                  className={cx('folders-tree', 'folders-tree--outer')}
                  role="tree"
                  aria-labelledby="tree_label"
                >
                  {folders.map((folder, idx) => (
                    <Folder
                      folder={folder}
                      key={folder.id || `${folder.name}-${idx}`}
                      activeFolder={activeFolderId}
                      instanceKey={instanceKey}
                      expandedIds={expandedIds}
                      onFolderClick={onFolderClick}
                      setAllTestCases={setAllTestCases}
                      onToggleFolder={onToggleFolder}
                      index={idx}
                      parentId={null}
                      enableDragAndDrop={isDragAndDropEnabled}
                      canDropOn={canDropOn}
                    />
                  ))}
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
