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
import {
  ChevronDownDropdownIcon,
  DragNDropIcon,
  BubblesLoader,
} from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { TransformedFolder } from 'controllers/testCase';
import { Folder } from 'pages/inside/common/expandedOptions/folder/folder';

import { DepthAwareCheckbox } from '../depthAwareCheckbox';
import { usePanelActions, usePanelState, CheckboxSelectionState } from '../testLibraryPanelContext';
import { SelectableTestCase } from '../selectableTestCase';
import { useFolderTestCases } from '../hooks/useFolderTestCases';
import { isFolderVisibleInTree } from '../utils';

import treeStyles from '../../expandedOptions/folder/folder.scss';
import styles from './selectableFolder.scss';

const cx = createClassnames(styles, treeStyles);

const LOAD_MORE_SCROLL_THRESHOLD_PX = 100;
const EMPTY_NUMBER_SET = new Set<number>();

interface SelectableFolderProps {
  folder: TransformedFolder;
  depth?: number;
}

export const SelectableFolder = ({ folder, depth = 0 }: SelectableFolderProps) => {
  const {
    toggleTestCasesSelection,
    toggleFolder,
    batchSelectFolder,
    batchDeselectFolder,
  } = usePanelActions();
  const {
    selectedIds,
    testCasesMap,
    checkboxStatesMap,
    expandedFolderIds,
    scrollElement,
    batchLoadingFolderIds,
    shouldHideAddedTestCases,
    testPlanIdsByFolderId,
  } = usePanelState();

  const isBatchLoading = batchLoadingFolderIds.has(folder.id);
  const isOpen = expandedFolderIds.has(folder.id);
  const subfolders = folder.folders;

  const {
    testCases = [],
    isLoading: isFolderLoading = false,
    addedToTestPlanIds = EMPTY_NUMBER_SET,
  } = testCasesMap.get(folder.id) ?? {};

  const prefetchedIds = testPlanIdsByFolderId.get(folder.id);
  const isKnownAllAdded =
    prefetchedIds != null && prefetchedIds.size >= folder.testsCount && folder.testsCount > 0;
  const shouldSkipFetch = shouldHideAddedTestCases && isKnownAllAdded && isEmpty(subfolders);

  const { fetchNextPage, hasNextPage, isLoading } = useFolderTestCases({
    folderId: folder.id,
    isOpen: isOpen && !shouldSkipFetch,
    testsCount: folder.testsCount,
  });

  const visibleSubfolders = useMemo(
    () =>
      subfolders.filter((subfolder) =>
        isFolderVisibleInTree({
          folder: subfolder,
          testPlanIdsByFolderId,
          shouldHideAddedTestCases,
        }),
      ),
    [subfolders, testPlanIdsByFolderId, shouldHideAddedTestCases],
  );

  const hasChildren =
    !isEmpty(visibleSubfolders) || (folder.testsCount > 0 && !(shouldHideAddedTestCases && isKnownAllAdded));

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

  const checkboxState = checkboxStatesMap.get(folder.id) ?? CheckboxSelectionState.UNCHECKED;

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

    const visibleTestCases = shouldHideAddedTestCases
      ? testCases.filter(({ id }) => !addedToTestPlanIds.has(id))
      : testCases;

    return (
      <>
        {visibleTestCases.map((testCase) => (
          <SelectableTestCase
            key={testCase.id}
            testCase={testCase}
            isSelected={selectedIds.has(testCase.id)}
            isAddedToTestPlan={addedToTestPlanIds.has(testCase.id)}
            depth={depth + 1}
            onToggle={toggleTestCase}
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
          isChecked={checkboxState === CheckboxSelectionState.CHECKED}
          isPartiallyChecked={checkboxState === CheckboxSelectionState.INDETERMINATE}
          onChange={handleFolderCheckboxChange}
          isLoading={isBatchLoading}
        />
      </div>
      <Folder.Subfolders shouldDisplay={isOpen && hasChildren}>
        {visibleSubfolders.map((subfolder) => (
          <SelectableFolder folder={subfolder} key={subfolder.id} depth={depth + 1} />
        ))}
        {renderTestCases()}
      </Folder.Subfolders>
    </Folder.Wrapper>
  );
};
