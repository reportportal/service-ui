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

import { moveTestCases } from './useReorderTestCases';

describe('moveTestCases', () => {
  const items = [1, 2, 3, 4, 5].map((id) => ({ id }));
  const ids = (list: { id: number }[]) => list.map(({ id }) => id);

  it('moves one test case before the anchor', () => {
    expect(ids(moveTestCases(items, [5], 1, 'before'))).toEqual([5, 1, 2, 3, 4]);
  });

  it('moves one test case after the anchor', () => {
    expect(ids(moveTestCases(items, [1], 5, 'after'))).toEqual([2, 3, 4, 5, 1]);
  });

  it('moves several test cases as one block in their current order', () => {
    expect(ids(moveTestCases(items, [4, 2], 1, 'before'))).toEqual([2, 4, 1, 3, 5]);
    expect(ids(moveTestCases(items, [1, 3], 4, 'after'))).toEqual([2, 4, 1, 3, 5]);
  });

  it('keeps the list when the anchor is one of the moved test cases', () => {
    expect(ids(moveTestCases(items, [2, 3], 3, 'after'))).toEqual([1, 2, 3, 4, 5]);
  });
});
