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

import { countFolderTestCases } from './countFolderTestCases';

const folder = (id: number, testsCount: number, folders: TransformedFolder[] = []) =>
  ({ id, name: `F${id}`, testsCount, parentFolderId: null, folders }) as TransformedFolder;

describe('countFolderTestCases', () => {
  test('sums the test cases of the folders and all their subfolders', () => {
    expect(
      countFolderTestCases([folder(1, 10, [folder(2, 5, [folder(3, 1)])]), folder(4, 100)]),
    ).toBe(116);
  });
});
