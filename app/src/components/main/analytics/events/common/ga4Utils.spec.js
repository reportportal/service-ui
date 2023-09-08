/*
 * Copyright 2023 EPAM Systems
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

import {
  normalizeEventParameter,
  getBasicClickEventParameters,
  getBasicEventParameters,
} from './ga4Utils';

describe('ga4Utils', () => {
  describe('getBasicEventParameters', () => {
    test('Should return object with correct properties', () => {
      const expectedResult = { action: 'action', category: 'category', place: '' };

      expect(getBasicEventParameters('action', 'category')).toEqual(expectedResult);
    });
  });

  describe('getBasicClickEventParameters', () => {
    test('Should return correct event object', () => {
      const expectedResult = { action: 'click', category: 'category', place: '' };
      expect(getBasicClickEventParameters('category')).toEqual(expectedResult);
    });
  });
  describe('normalizeEventParameter', () => {
    test('Should return empty string if argument is not provided', () => {
      expect(normalizeEventParameter()).toBe('');
    });

    test('Should replace all white spaces with underscores', () => {
      const input = 'Test string with several spaces';
      const expectedResult = 'test_string_with_several_spaces';

      expect(normalizeEventParameter(input)).toBe(expectedResult);
    });

    test('Should normalize string to lower case', () => {
      const input = 'HeLlOWoRlD';
      const expectedResult = 'helloworld';

      expect(normalizeEventParameter(input)).toBe(expectedResult);
    });
  });
});
