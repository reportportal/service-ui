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

import { TransformedFolder } from 'controllers/testCase';

import { getSubfolderTotalsById } from './utils';
import { getFolderCounter } from './folder/folder';

const folder = (
  id: number,
  testsCount: number,
  folders: TransformedFolder[] = [],
): TransformedFolder => ({
  id,
  name: `Folder ${id}`,
  testsCount,
  parentFolderId: null,
  folders,
});

describe('subfolder totals', () => {
  const tree = [folder(1, 8, [folder(2, 190, [folder(3, 15)]), folder(4, 0)]), folder(5, 3)];

  test('getSubfolderTotalsById sums every folder with all its subfolders', () => {
    expect(Object.fromEntries(getSubfolderTotalsById(tree))).toEqual({
      1: 213,
      2: 205,
      3: 15,
      4: 0,
      5: 3,
    });
  });

  test('does not change the folders', () => {
    getSubfolderTotalsById(tree);

    expect(tree[0].testsCount).toBe(8);
  });
});

describe('getFolderCounter', () => {
  test('Tree and Flat view: local/total for a folder with subfolders', () => {
    expect(
      getFolderCounter({
        testsCount: 6,
        totalTestsCount: 213,
        hasSubfolders: true,
        showTotalOnly: false,
      }),
    ).toBe('6/213');
  });

  test('Tree and Flat view: one number for a folder without subfolders', () => {
    expect(
      getFolderCounter({
        testsCount: 2,
        totalTestsCount: 2,
        hasSubfolders: false,
        showTotalOnly: false,
      }),
    ).toBe('2');
  });

  test('All test cases within subfolders: the total only', () => {
    expect(
      getFolderCounter({
        testsCount: 6,
        totalTestsCount: 213,
        hasSubfolders: true,
        showTotalOnly: true,
      }),
    ).toBe('213');
  });

  test('without a total: the local number', () => {
    expect(getFolderCounter({ testsCount: 4, hasSubfolders: true, showTotalOnly: true })).toBe('4');
  });
});
