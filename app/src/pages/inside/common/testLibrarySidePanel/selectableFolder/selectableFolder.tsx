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

import { useCallback, useEffect, useMemo } from 'react';
import { isEmpty } from 'es-toolkit/compat';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import { ChevronDownDropdownIcon, DragNDropIcon, BubblesLoader } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { TransformedFolder } from 'controllers/testCase';
import { Folder } from 'pages/inside/common/expandedOptions/folder/folder';
import { NumberSet, FolderTestCases } from '../testLibraryPanelContext';

import { DepthAwareCheckbox } from '../depthAwareCheckbox';
import { useTestLibraryPanelContext } from '../testLibraryPanelContext';
import { useFolderTestCases } from './useFolderTestCases';
import { SelectableTestCase } from '../selectableTestCase';

import treeStyles from '../../expandedOptions/folder/folder.scss';
import styles from './selectableFolder.scss';

const cx = createClassnames(styles, treeStyles);

const LOAD_MORE_SCROLL_THRESHOLD_PX = 100;

interface SelectableFolderProps {
  folder: TransformedFolder;
  depth?: number;
}

enum CheckboxSelectionState {
  CHECKED = 'checked',
  UNCHECKED = 'unchecked',
  INDETERMINATE = 'indeterminate',
}

interface SubtreeSelectionCounts {
  totalSelectable: number;
  totalSelected: number;
  emptyFolderCount: number;
  selectedEmptyFolderCount: number;
}

const getSubtreeSelectionCounts = (
  folder: TransformedFolder,
  selectedIds: NumberSet,
  selectedFolderIds: NumberSet,
  testCasesMap: Map<number, FolderTestCases>,
): SubtreeSelectionCounts => {
  let totalSelectable = 0;
  let totalSelected = 0;
  let emptyFolderCount = 0;
  let selectedEmptyFolderCount = 0;

  const folderData = testCasesMap.get(folder.id);
  const addedToTestPlanIds = folderData?.addedToTestPlanIds ?? [];
  const addedIdsSet = new Set(addedToTestPlanIds);
  const testCases = folderData?.testCases ?? [];

  const selectableTestCases = isEmpty(addedToTestPlanIds)
    ? testCases
    : testCases.filter((testCase) => !addedIdsSet.has(testCase.id));

  totalSelectable += selectableTestCases.length;
  totalSelected += selectableTestCases.filter((testCase) => selectedIds.has(testCase.id)).length;

  if (folder.testsCount === 0 && isEmpty(folder.folders)) {
    emptyFolderCount += 1;
    if (selectedFolderIds.has(folder.id)) {
      selectedEmptyFolderCount += 1;
    }
  }

  folder.folders.forEach((subfolder) => {
    const subfolderCounts = getSubtreeSelectionCounts(
      subfolder,
      selectedIds,
      selectedFolderIds,
      testCasesMap,
    );
    totalSelectable += subfolderCounts.totalSelectable;
    totalSelected += subfolderCounts.totalSelected;
    emptyFolderCount += subfolderCounts.emptyFolderCount;
    selectedEmptyFolderCount += subfolderCounts.selectedEmptyFolderCount;
  });

  return {
    totalSelectable,
    totalSelected,
    emptyFolderCount,
    selectedEmptyFolderCount,
  };
};

export const SelectableFolder = ({ folder, depth = 0 }: SelectableFolderProps) => {
  const {
    selectedIds,
    selectedFolderIds,
    testCasesMap,
    expandedFolderIds,
    scrollElement,
    toggleTestCasesSelection,
    toggleFolder,
    batchSelectFolder,
    batchDeselectFolder,
  } = useTestLibraryPanelContext();

  const isOpen = expandedFolderIds.has(folder.id);
  const hasChildren = !isEmpty(folder.folders) || folder.testsCount > 0;

  const {
    testCases = [],
    isLoading: isFolderLoading = false,
    addedToTestPlanIds = [],
  } = testCasesMap.get(folder.id) ?? {};

  const { fetchNextPage, hasNextPage, isLoading } = useFolderTestCases({
    folderId: folder.id,
    isOpen,
    testsCount: folder.testsCount,
  });

  const [infiniteRef, { rootRef }] = useInfiniteScroll({
    loading: isLoading || isFolderLoading,
    hasNextPage,
    disabled: !isOpen || isEmpty(testCases),
    rootMargin: `0px 0px ${LOAD_MORE_SCROLL_THRESHOLD_PX}px 0px`,
    onLoadMore: fetchNextPage,
  });

  useEffect(() => {
    if (scrollElement) {
      rootRef(scrollElement as Element);
    }
  }, [scrollElement, rootRef]);

  const checkboxState = useMemo(() => {
    const subtreeCounts = getSubtreeSelectionCounts(
      folder,
      selectedIds,
      selectedFolderIds,
      testCasesMap,
    );

    if (subtreeCounts.totalSelectable === 0 && subtreeCounts.emptyFolderCount === 0) {
      return CheckboxSelectionState.UNCHECKED;
    }

    const allTestCasesSelected =
      subtreeCounts.totalSelectable > 0 &&
      subtreeCounts.totalSelected === subtreeCounts.totalSelectable;
    const allEmptyFoldersSelected =
      subtreeCounts.emptyFolderCount > 0 &&
      subtreeCounts.selectedEmptyFolderCount === subtreeCounts.emptyFolderCount;

    if (
      (subtreeCounts.totalSelectable === 0 || allTestCasesSelected) &&
      (subtreeCounts.emptyFolderCount === 0 || allEmptyFoldersSelected)
    ) {
      return CheckboxSelectionState.CHECKED;
    }

    if (subtreeCounts.totalSelected === 0 && subtreeCounts.selectedEmptyFolderCount === 0) {
      return CheckboxSelectionState.UNCHECKED;
    }

    return CheckboxSelectionState.INDETERMINATE;
  }, [folder, selectedIds, selectedFolderIds, testCasesMap]);

  const onFolderToggle = useCallback(() => {
    if (!hasChildren) {
      return;
    }

    toggleFolder(folder);
  }, [folder, hasChildren, toggleFolder]);

  const handleFolderCheckboxChange = useCallback(() => {
    if (checkboxState === CheckboxSelectionState.CHECKED) {
      batchDeselectFolder(folder);
    } else {
      void batchSelectFolder(folder);
    }
  }, [checkboxState, batchDeselectFolder, batchSelectFolder, folder]);

  const toggleTestCase = useCallback(
    (testCaseId: number) => {
      toggleTestCasesSelection([testCaseId]);
    },
    [toggleTestCasesSelection],
  );

  const renderTestCases = () => {
    if (isLoading && isEmpty(testCases)) {
      return (
        <div className={cx('selectable-folder__loader')}>
          <BubblesLoader />
        </div>
      );
    }

    if (isEmpty(testCases)) {
      return null;
    }

    return (
      <>
        {testCases.map((testCase) => (
          <SelectableTestCase
            key={testCase.id}
            testCase={testCase}
            isSelected={selectedIds.has(testCase.id)}
            isAddedToTestPlan={addedToTestPlanIds.includes(testCase.id)}
            onToggle={toggleTestCase}
            depth={depth + 1}
          />
        ))}
        {hasNextPage && (
          <div ref={infiniteRef} className={cx('selectable-folder__load-more')}>
            <BubblesLoader />
          </div>
        )}
      </>
    );
  };

  return (
    <Folder.Wrapper isOpen={isOpen} className={cx('selectable-tree__item')}>
      <div
        className={cx('folders-tree__item-content', 'selectable-tree__item-content', {
          'selectable-tree__item-empty': !hasChildren,
        })}
      >
        {hasChildren && <ChevronDownDropdownIcon onClick={onFolderToggle} />}
        <button
          className={cx('folders-tree__item-title', 'selectable-tree__item-title')}
          onClick={onFolderToggle}
        >
          <span className={cx('folders-tree__item-title--text')} title={folder.name}>
            {folder.name}
          </span>
        </button>
        <span>
          <DragNDropIcon />
        </span>
        <DepthAwareCheckbox
          depth={depth}
          checked={checkboxState === CheckboxSelectionState.CHECKED}
          partiallyChecked={checkboxState === CheckboxSelectionState.INDETERMINATE}
          onChange={handleFolderCheckboxChange}
        />
      </div>
      <Folder.Subfolders shouldDisplay={isOpen && hasChildren}>
        {folder.folders?.map((subfolder) => (
          <SelectableFolder folder={subfolder} key={subfolder.id} depth={depth + 1} />
        ))}
        {renderTestCases()}
      </Folder.Subfolders>
    </Folder.Wrapper>
  );
};
