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

import { parseThreshold, toPipelineSettingsPatch } from './pipelineSettingsUtils';

describe('pipeline settings utils', () => {
  test.each([
    ['0', 0],
    ['90', 90],
    ['100', 100],
  ])('accepts an integer threshold %s', (value, expected) => {
    expect(parseThreshold(value)).toBe(expected);
  });

  test.each(['', '-1', '1.5', '101', 'abc', ' 90 '])('rejects invalid threshold %s', (value) => {
    expect(parseThreshold(value)).toBeNull();
  });

  test('maps the UI model to the live LP5 request contract', () => {
    expect(toPipelineSettingsPatch(false, 80)).toEqual({
      autoReadyEnabled: false,
      autoReadyThreshold: 80,
    });
  });
});
