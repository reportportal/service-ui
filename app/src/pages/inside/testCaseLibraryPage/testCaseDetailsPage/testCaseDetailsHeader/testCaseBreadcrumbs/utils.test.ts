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

import { Folder } from 'controllers/testCase/types';

import { getFolderPath, splitFolderPath } from './utils';

const createChain = (depth: number): Folder[] =>
  Array.from({ length: depth }, (_, index) => ({
    id: index + 1,
    name: `Folder ${index + 1}`,
    parentFolderId: index === 0 ? null : index,
    countOfTestCases: 0,
  }));

const names = (folders: { name: string }[]) => folders.map(({ name }) => name);

describe('getFolderPath', () => {
  it('returns the path from the root folder to the test case folder', () => {
    expect(getFolderPath(3, createChain(5))).toEqual([
      { id: 1, name: 'Folder 1' },
      { id: 2, name: 'Folder 2' },
      { id: 3, name: 'Folder 3' },
    ]);
  });

  it('returns an empty path when the folder id is missing', () => {
    expect(getFolderPath(undefined, createChain(2))).toEqual([]);
    expect(getFolderPath(null, createChain(2))).toEqual([]);
  });

  it('returns an empty path while folders are not loaded', () => {
    expect(getFolderPath(3, [])).toEqual([]);
  });

  it('stops at a parent folder that is not in the list', () => {
    const folders = createChain(4).filter(({ id }) => id !== 2);

    expect(names(getFolderPath(4, folders))).toEqual(['Folder 3', 'Folder 4']);
  });
});

describe('splitFolderPath', () => {
  it.each([0, 1, 2, 3])('shows all %i folders without collapsing', (depth) => {
    const path = getFolderPath(depth, createChain(depth));

    expect(splitFolderPath(path)).toEqual({ hiddenFolders: [], shownFolders: path });
  });

  it('hides one folder when there are 6 levels', () => {
    const { hiddenFolders, shownFolders } = splitFolderPath(getFolderPath(4, createChain(4)));

    expect(names(hiddenFolders)).toEqual(['Folder 1']);
    expect(names(shownFolders)).toEqual(['Folder 2', 'Folder 3', 'Folder 4']);
  });

  it('keeps the three nearest parent folders for a deep path', () => {
    const { hiddenFolders, shownFolders } = splitFolderPath(getFolderPath(7, createChain(7)));

    expect(names(hiddenFolders)).toEqual(['Folder 1', 'Folder 2', 'Folder 3', 'Folder 4']);
    expect(names(shownFolders)).toEqual(['Folder 5', 'Folder 6', 'Folder 7']);
  });
});
