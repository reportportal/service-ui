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

import { PROJECT_ATTRIBUTES_DELIMITER } from './constants';
import { normalizeAttributesWithPrefix } from './utils';

describe('project/utils', () => {
  const prefix = 'prefix';
  const attributes = {
    numberOfLogLines: '3',
  };
  const normalizedAttributes = {
    [`${prefix}${PROJECT_ATTRIBUTES_DELIMITER}numberOfLogLines`]: '3',
  };
  describe('normalizeAttributesWithPrefix', () => {
    test('should return an empty object if case of empty arguments', () => {
      expect(normalizeAttributesWithPrefix({}, '')).toEqual({});
      expect(normalizeAttributesWithPrefix({}, prefix)).toEqual({});
    });
    test('should return the same object if case of no prefix', () => {
      expect(normalizeAttributesWithPrefix(attributes)).toEqual(attributes);
    });
    test('should return object containing attribute keys with the corresponding prefix', () => {
      expect(normalizeAttributesWithPrefix(attributes, prefix)).toEqual(normalizedAttributes);
    });
  });
});
