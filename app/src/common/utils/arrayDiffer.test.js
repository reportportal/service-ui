/*
 * Copyright 2019 EPAM Systems
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

import { arrayDiffer } from './arrayDiffer';

describe('arrayDiffer', () => {
  test('should return empty array in case of no arguments', () => {
    expect(arrayDiffer()).toEqual([]);
  });
  test('should return first argument in case of no other arguments', () => {
    expect(arrayDiffer([1, 2, 3])).toEqual([1, 2, 3]);
  });
  test('should return array of values form first argument, not from other arguments', () => {
    expect(arrayDiffer([1, 2, 3], [2, 3, 4])).toEqual([1]);
  });
});
