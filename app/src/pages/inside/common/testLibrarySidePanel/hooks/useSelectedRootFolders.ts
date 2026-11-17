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

import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { transformedFoldersSelector, TransformedFolder } from 'controllers/testCase';

import { CheckboxSelectionState, usePanelState } from '../testLibraryPanelContext';

const getFlatFoldersIndex = (folders: TransformedFolder[]) => {
  const foldersIndex = new Map<number, TransformedFolder>();

  const indexFolderAndDescendants = (foldersList: TransformedFolder[]) => {
    foldersList.forEach((node) => {
      foldersIndex.set(node.id, node);
      indexFolderAndDescendants(node.folders);
    });
  };

  indexFolderAndDescendants(folders);

  return foldersIndex;
};

export const useSelectedRootFolders = () => {
  const { checkboxStatesMap } = usePanelState();
  const flatFolders = useSelector(transformedFoldersSelector);

  const flatFoldersMap = useMemo(() => getFlatFoldersIndex(flatFolders), [flatFolders]);

  const selectedRootFolders = useMemo(() => {
    const checkedFolderIds = new Set(
      Array.from(checkboxStatesMap.entries())
        .filter(([, state]) => state === CheckboxSelectionState.CHECKED)
        .map(([id]) => id),
    );

    const rootFolders: TransformedFolder[] = [];

    checkedFolderIds.forEach((id) => {
      const checkedFolder = flatFoldersMap.get(id);

      if (!checkedFolder) {
        return;
      }

      if (!checkedFolder.parentFolderId || !checkedFolderIds.has(checkedFolder.parentFolderId)) {
        rootFolders.push(checkedFolder);
      }
    });

    return rootFolders;
  }, [checkboxStatesMap, flatFoldersMap]);

  const selectedRootFolderIds = useMemo(
    () => new Set(selectedRootFolders.map(({ id }) => id)),
    [selectedRootFolders],
  );

  return { flatFoldersMap, selectedRootFolders, selectedRootFolderIds };
};
