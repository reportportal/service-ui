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

import { getAllFolderIdsToDelete, getAllSubfolderIds } from 'common/utils/folderUtils';
import { transformFoldersWithFullPath } from './utils';
import { testCaseReducer } from './reducer';
import { updateFolderCountersAction } from './actionCreators';
import { Folder } from './types';

const folder = (id: number, parentFolderId: number | null, name = `F${id}`): Folder => ({
  id,
  name,
  parentFolderId,
  countOfTestCases: 1,
});

describe('folder tree utils', () => {
  const folders = [
    folder(1, null, 'Root'),
    folder(2, 1, 'A'),
    folder(3, 2, 'B'),
    folder(4, 1, 'C'),
  ];

  test('builds full paths in the same order as before', () => {
    expect(transformFoldersWithFullPath(folders).map(({ id, fullPath }) => [id, fullPath])).toEqual(
      [
        [3, 'Root / A / B'],
        [2, 'Root / A'],
        [4, 'Root / C'],
        [1, 'Root'],
      ],
    );
  });

  test('collects a folder with all its descendants', () => {
    expect(getAllFolderIdsToDelete(1, folders)).toEqual([1, 2, 3, 4]);
    expect(getAllSubfolderIds(2, folders)).toEqual([2, 3]);
  });

  test('handles a 10k-folder library in linear time', () => {
    const many = Array.from({ length: 10000 }, (_, index) =>
      folder(index + 1, index < 100 ? null : (index % 100) + 1),
    );
    const startedAt = Date.now();

    expect(transformFoldersWithFullPath(many)).toHaveLength(10000);
    expect(getAllSubfolderIds(1, many)).toHaveLength(100);
    // The previous O(n^2) implementation needed ~1e8 comparisons here.
    expect(Date.now() - startedAt).toBeLessThan(200);
  });
});

describe('UPDATE_FOLDER_COUNTERS', () => {
  test('applies all deltas in one update', () => {
    const state = testCaseReducer(undefined, { type: 'init' });
    const withFolders = {
      ...state,
      folders: { ...state.folders, data: [folder(1, null), folder(2, null), folder(3, null)] },
    };

    const next = testCaseReducer(withFolders, updateFolderCountersAction({ 1: -1, 3: 2 }));
    const nextFolders = next.folders.data as Folder[];

    expect(nextFolders.map(({ countOfTestCases }) => countOfTestCases)).toEqual([0, 1, 3]);
    expect(nextFolders[1]).toBe(withFolders.folders.data[1]);
  });
});
