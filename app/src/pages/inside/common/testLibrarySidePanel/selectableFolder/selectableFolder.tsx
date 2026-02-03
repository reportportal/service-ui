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
import { useDispatch } from 'react-redux';
import { isEmpty, size } from 'es-toolkit/compat';
import { ChevronDownDropdownIcon, DragNDropIcon } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { TransformedFolder, getTestCaseByFolderIdAction } from 'controllers/testCase';
import { Folder } from 'pages/inside/common/expandedOptions/folder/folder';
import { SelectableTestCase } from 'pages/inside/common/testLibrarySidePanel/selectableTestCase/selectableTestCase';

import { DepthAwareCheckbox } from '../depthAwareCheckbox';
import { useTestLibraryPanelContext } from '../testLibraryPanelContext';

import treeStyles from '../../expandedOptions/folder/folder.scss';
import styles from './selectableFolder.scss';

const cx = createClassnames(styles, treeStyles);

interface SelectableFolderProps {
  folder: TransformedFolder;
  depth?: number;
}

enum CheckboxSelectionState {
  CHECKED = 'checked',
  UNCHECKED = 'unchecked',
  INDETERMINATE = 'indeterminate',
}

export const SelectableFolder = ({ folder, depth = 0 }: SelectableFolderProps) => {
  const {
    selectedIds,
    selectedFolderIds,
    testPlanTestCaseIds,
    testCasesMap,
    fetchedFolderIds,
    expandedFolderIds,
    toggleTestCasesSelection,
    toggleFolderSelection,
    onFolderFetched,
    toggleFolder,
  } = useTestLibraryPanelContext();
  const dispatch = useDispatch();

  const testCases = useMemo(() => testCasesMap.get(folder.id) || [], [testCasesMap, folder.id]);
  const isOpen = expandedFolderIds.has(folder.id);
  const hasChildren = !isEmpty(folder.folders) || folder.testsCount > 0;

  useEffect(() => {
    if (isOpen && !fetchedFolderIds.has(folder.id)) {
      dispatch(
        getTestCaseByFolderIdAction({
          folderId: folder.id,
          offset: 0,
          limit: 50,
        }),
      );

      onFolderFetched(folder.id);
    }
  }, [isOpen, folder.id, fetchedFolderIds, dispatch, onFolderFetched]);

  const checkboxState = useMemo(() => {
    if (isEmpty(testCases)) {
      return selectedFolderIds.has(folder.id)
        ? CheckboxSelectionState.CHECKED
        : CheckboxSelectionState.UNCHECKED;
    }

    const selectedCount = size(testCases.filter((testCase) => selectedIds.has(testCase.id)));

    if (selectedCount === 0) {
      return CheckboxSelectionState.UNCHECKED;
    }

    if (selectedCount === testCases.length) {
      return CheckboxSelectionState.CHECKED;
    }

    return CheckboxSelectionState.INDETERMINATE;
  }, [testCases, selectedIds, selectedFolderIds, folder.id]);

  const onFolderToggle = useCallback(() => {
    if (!hasChildren) {
      return;
    }

    toggleFolder(folder);
  }, [folder, hasChildren, toggleFolder]);

  const handleFolderCheckboxChange = useCallback(() => {
    if (isEmpty(testCases)) {
      toggleFolderSelection(folder.id);
    } else {
      const testCaseIds = testCases.map((testCase) => testCase.id);

      if (checkboxState === CheckboxSelectionState.CHECKED) {
        toggleTestCasesSelection(testCaseIds);
      } else {
        const notSelectedTestCases = testCaseIds.filter((id) => !selectedIds.has(id));

        if (!isEmpty(notSelectedTestCases)) {
          toggleTestCasesSelection(notSelectedTestCases);
        }
      }
    }
  }, [
    testCases,
    toggleFolderSelection,
    folder.id,
    checkboxState,
    selectedIds,
    toggleTestCasesSelection,
  ]);

  const toggleTestCase = useCallback(
    (testCaseId: number) => {
      toggleTestCasesSelection([testCaseId]);
    },
    [toggleTestCasesSelection],
  );

  const renderTestCases = () =>
    !isEmpty(testCases) && (
      <>
        {testCases.map((testCase) => (
          <SelectableTestCase
            key={testCase.id}
            testCase={testCase}
            isSelected={selectedIds.has(testCase.id)}
            isAddedToTestPlan={testPlanTestCaseIds.has(testCase.id)}
            onToggle={toggleTestCase}
            depth={depth + 1}
          />
        ))}
      </>
    );

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
