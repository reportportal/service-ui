/*
 * Copyright 2021 EPAM Systems
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

import { getDefectTypeLabel } from './utils';

describe('getDefectTypeLabel', () => {
  test('should return empty string in case of no arguments', () => {
    expect(getDefectTypeLabel()).toBe('');
  });
  test('should return empty string in case of condition has invalid structure', () => {
    expect(getDefectTypeLabel(null)).toBe('');
    expect(getDefectTypeLabel(123)).toBe('');
    expect(getDefectTypeLabel('foo')).toBe('');
    expect(getDefectTypeLabel('statistics$defects')).toBe('');
    expect(getDefectTypeLabel('statistics$defects$to_investigate')).toBe('');
  });
  test('should return defect type name according to provided condition with main defect type', () => {
    expect(getDefectTypeLabel('statistics$defects$product_bug$pb001')).toBe('product bug');
    expect(getDefectTypeLabel('statistics$defects$automation_bug$ab001')).toBe('automation bug');
    expect(getDefectTypeLabel('statistics$defects$system_issue$si001')).toBe('system issue');
    expect(getDefectTypeLabel('statistics$defects$no_defect$nd001')).toBe('no defect');
    expect(getDefectTypeLabel('statistics$defects$to_investigate$ti001')).toBe('to investigate');
  });
  test('should return defect type name and "Total" prefix according to provided condition with total', () => {
    expect(getDefectTypeLabel('statistics$defects$product_bug$total')).toBe('Total product bug');
    expect(getDefectTypeLabel('statistics$defects$automation_bug$total')).toBe(
      'Total automation bug',
    );
    expect(getDefectTypeLabel('statistics$defects$system_issue$total')).toBe('Total system issue');
    expect(getDefectTypeLabel('statistics$defects$no_defect$total')).toBe('Total no defect');
    expect(getDefectTypeLabel('statistics$defects$to_investigate$total')).toBe(
      'Total to investigate',
    );
  });
  test('should return defect type name and "Custom" prefix according to provided condition with defect subtype', () => {
    expect(getDefectTypeLabel('statistics$defects$product_bug$pb123')).toBe('Custom product bug');
    expect(getDefectTypeLabel('statistics$defects$automation_bug$ab123')).toBe(
      'Custom automation bug',
    );
  });
});
