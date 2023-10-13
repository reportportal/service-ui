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
  calculateNextIndex,
  calculatePrevIndex,
  calculateDefaultIndex,
  calculateCurrentItemIndex,
} from './utils';

describe('dropdown utils', () => {
  const options = [
    { disabled: true, value: 'option1' },
    { disabled: true, value: 'option2' },
    { disabled: false, value: 'option3' },
    { disabled: true, value: 'option4' },
    { disabled: false, value: 'option5' },
  ];
  describe('calculateNextIndex', () => {
    test('Should calculate correct nearest next index', () => {
      expect(calculateNextIndex(0, options)).toBe(2);
    });
  });

  describe('calculateNextIndex', () => {
    test('Should calculate correct nearest next index', () => {
      expect(calculatePrevIndex(0, options)).toBe(4);
    });
  });

  describe('calculateDefaultIndex', () => {
    test('Should works correctly with primitive values', () => {
      expect(calculateDefaultIndex(options, 'option3')).toBe(2);
    });
    test('Should works correctly with objects', () => {
      expect(calculateDefaultIndex(options, { value: 'option4' })).toBe(3);
    });
  });

  describe('calculateCurrentItemIndex', () => {
    test('should return indexes less or equals of array length', () => {
      options.forEach((_, index, self) => {
        expect(calculateCurrentItemIndex(index + self.length * index, self.length)).toBe(index);
      });
    });
  });
});
