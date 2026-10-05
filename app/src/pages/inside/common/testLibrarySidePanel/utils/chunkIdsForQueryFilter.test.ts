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

import { chunkIdsForQueryFilter } from './chunkIdsForQueryFilter';

describe('chunkIdsForQueryFilter', () => {
  test('should return empty array for empty input', () => {
    expect(chunkIdsForQueryFilter([])).toEqual([]);
  });

  test('should keep small lists in a single chunk', () => {
    expect(chunkIdsForQueryFilter([1, 2, 3])).toEqual([[1, 2, 3]]);
  });

  test('should split ids so each chunk stays within encoded length limit', () => {
    const ids = Array.from({ length: 500 }, (_, index) => 100000 + index);
    const chunks = chunkIdsForQueryFilter(ids, 200);

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.flat()).toEqual(ids);
    chunks.forEach((chunk) => {
      expect(encodeURIComponent(chunk.join(',')).length).toBeLessThanOrEqual(200);
    });
  });
});
