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

import { formatCost, formatTokens } from './aiFactoryFormatUtils';

describe('formatCost', () => {
  test.each([
    [0.32, '$0.32'],
    [1.5, '$1.50'],
    [0, '$0.00'],
    [1.276, '$1.28'], // rounds, does not truncate
    [12.005, '$12.01'],
  ])('formats %s as %s', (amount, expected) => {
    expect(formatCost(amount)).toBe(expected);
  });
});

describe('formatTokens', () => {
  test.each([
    [0, '0'],
    [900, '900'],
    [1000, '1.0k'],
    [612000, '612.0k'],
    [999999, '1000.0k'],
    [1000000, '1.00M'],
    [2104000, '2.10M'],
  ])('formats %s as %s', (count, expected) => {
    expect(formatTokens(count)).toBe(expected);
  });
});
