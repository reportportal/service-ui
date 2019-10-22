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

import { getPreviousItem, getNextItem } from './utils';

describe('log/utils', () => {
  const itemsArray = [{ id: 0 }, { id: 1 }, { id: 2 }];
  describe('getPreviousItem', () => {
    test('should return null in case of item array length < 2', () => {
      expect(getPreviousItem([], 1)).toBe(null);
      expect(getPreviousItem([{ id: 1 }], 1)).toBe(null);
    });
    test('should return null if the first item is active', () => {
      expect(getPreviousItem(itemsArray, 0)).toBe(null);
    });
    test('should return item if active item index > 0', () => {
      expect(getPreviousItem(itemsArray, 1)).toEqual({ id: 0 });
      expect(getPreviousItem(itemsArray, 2)).toEqual({ id: 1 });
    });
  });
  describe('getNextItem', () => {
    test('should return null in case of item array length <= 1', () => {
      expect(getNextItem([], 0)).toBe(null);
      expect(getNextItem([{ id: 0 }, 0])).toBe(null);
    });
    test('should return null if the last item is active', () => {
      expect(getNextItem(itemsArray, 2)).toBe(null);
    });
    test('should return item if active item is not last', () => {
      expect(getNextItem(itemsArray, 0)).toEqual({ id: 1 });
      expect(getNextItem(itemsArray, 1)).toEqual({ id: 2 });
    });
  });
});
