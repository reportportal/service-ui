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

import {
  COLOR_AUTOMATION_BUG,
  COLOR_CHART_FAILED,
  COLOR_CHART_PASSED,
  COLOR_CHART_SKIPPED,
  COLOR_PRODUCT_BUG,
} from 'common/constants/colors';
import { getLaunchStatisticsColor } from './chartColors';

const DEFECT_TYPES = {
  PRODUCT_BUG: [
    { locator: 'product_bug', color: '#111111' },
    { locator: 'pb001', color: '#222222' },
    { locator: 'pb_custom', color: '#333333' },
  ],
  AUTOMATION_BUG: [{ locator: 'automation_bug', color: '#444444' }],
};

describe('getLaunchStatisticsColor', () => {
  test.each([
    ['statistics$executions$passed', COLOR_CHART_PASSED],
    ['statistics$executions$failed', COLOR_CHART_FAILED],
    ['statistics$executions$skipped', COLOR_CHART_SKIPPED],
  ])('execution status %s uses the DS 6 status color', (name, expected) => {
    expect(getLaunchStatisticsColor(name, DEFECT_TYPES)).toBe(expected);
  });

  test('group-level defect (total) uses the default group color, not the project color', () => {
    expect(getLaunchStatisticsColor('statistics$defects$product_bug$total', DEFECT_TYPES)).toBe(
      COLOR_PRODUCT_BUG,
    );
    expect(
      getLaunchStatisticsColor('statistics$defects$automation_bug$automation_bug', DEFECT_TYPES),
    ).toBe(COLOR_AUTOMATION_BUG);
  });

  test('the default subtype of a group (first locator) is treated as the group', () => {
    expect(
      getLaunchStatisticsColor('statistics$defects$product_bug$product_bug', DEFECT_TYPES),
    ).toBe(COLOR_PRODUCT_BUG);
  });

  test('custom defect subtypes keep the color configured in the project', () => {
    expect(getLaunchStatisticsColor('statistics$defects$product_bug$pb001', DEFECT_TYPES)).toBe(
      '#222222',
    );
    expect(getLaunchStatisticsColor('statistics$defects$product_bug$pb_custom', DEFECT_TYPES)).toBe(
      '#333333',
    );
  });
});
