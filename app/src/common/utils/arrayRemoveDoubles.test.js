/*
 * Copyright 2022 EPAM Systems
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

import { arrayRemoveDoubles } from './arrayRemoveDoubles';

describe('arrayRemoveDoubles', () => {
  test('should return empty array in case of no arguments', () => {
    expect(arrayRemoveDoubles()).toEqual([]);
  });
  test('should return initial array in case of no duplicates', () => {
    expect(arrayRemoveDoubles([1, 2, 3])).toEqual([1, 2, 3]);
  });
  test('should return array without duplicated values (numbers)', () => {
    expect(arrayRemoveDoubles([1, 2, 3, 2, 3, 4])).toEqual([1, 2, 3, 4]);
  });
  test('should return array without duplicated values (numbers #2)', () => {
    expect(arrayRemoveDoubles([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1])).toEqual([1]);
  });
  test('should return array without duplicated values (strings)', () => {
    expect(arrayRemoveDoubles(['a', 'b', 'c', 'a', 'a', 'c'])).toEqual(['a', 'b', 'c']);
  });
});
