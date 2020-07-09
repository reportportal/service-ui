/*
 * Copyright 2020 EPAM Systems
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
  COLOR_BLACK_2,
  COLOR_WHITE_TWO,
  COLOR_TO_INVESTIGATE,
  COLOR_PRODUCT_BUG,
} from 'common/constants/colors';
import { calculateFontColor } from './calculateFontColor';

describe('calculateFontColor', () => {
  test('should return black color in case of empty arguments', () => {
    expect(calculateFontColor()).toBe(COLOR_BLACK_2);
  });

  test('should return black color in case of bright argument color', () => {
    expect(calculateFontColor(COLOR_TO_INVESTIGATE)).toBe(COLOR_BLACK_2);
  });

  test('should return white color in case of dark argument color', () => {
    expect(calculateFontColor(COLOR_PRODUCT_BUG)).toBe(COLOR_WHITE_TWO);
  });
});
