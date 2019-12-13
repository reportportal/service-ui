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

import { range } from './range';

describe('range', () => {
  test('it should return an array', () => {
    expect(Array.isArray(range(0, 10))).toEqual(true);
  });
  test('it should return an empty array when invoked with no arguments', () => {
    expect(range()).toEqual([]);
  });
  test('it should return an array with correct length', () => {
    const result = range(0, 5);
    expect(result.length).toEqual(5);
  });
  test('it should return an array of numbers increasing on step', () => {
    expect(range(0, 10, 2)).toEqual([0, 2, 4, 6, 8]);
  });
  test('it should return an empty array negative range', () => {
    expect(range(5, -2)).toEqual([]);
  });
  test('it should return a proper array of elements for non zero start', () => {
    expect(range(44)).toEqual([]);
    expect(range(20, 23)).toEqual([20, 21, 22]);
  });
  test('it should return an empty array for negative start', () => {
    expect(range(-1)).toEqual([]);
  });
});
