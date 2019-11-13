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

import { normalizeTestItem, formatItemName } from './utils';

describe('controllers/testItem/utils', () => {
  describe('normalizeTestItem', () => {
    test('should add missing defect statistics from project config with count set to 0', () => {
      const defectConfig = {
        TO_INVESTIGATE: [{ locator: 'ti001' }, { locator: 'ti002' }],
        AUTOMATION_BUG: [{ locator: 'ab001' }],
      };
      const testItem = {
        id: 0,
        name: 'test item',
        statistics: {
          defects: {
            to_investigate: {
              total: 2,
              ti001: 3,
            },
          },
        },
      };
      expect(normalizeTestItem(testItem, defectConfig)).toEqual({
        id: 0,
        name: 'test item',
        statistics: {
          defects: {
            to_investigate: {
              total: 2,
              ti001: 3,
              ti002: 0,
            },
            automation_bug: {
              total: 0,
              ab001: 0,
            },
          },
        },
      });
    });
  });

  describe('formatItemName', () => {
    test('should return unchanged item name value', () => {
      const itemName = 'Short test item name';

      expect(formatItemName(itemName)).toBe(itemName);
    });

    test('should return shorten item name value with dots in the end', () => {
      const longItemName =
        'Long test item nameLong test item nameLong test item nameLong test item nameLong test item nameLong test item nameLong test item nameLong test item nameLong test item nameLong test item nameLong test item nameLong test item nameLong test item nameLong test item nameLong test item nameLong test item nameLong test item nameLong test item nameLong test item nameLong test item nameLong test item nameLong test item nameLong test item nameLong test item nameLong test item nameLong test item nameLong test item nameLong test item nameLong test item nameLong test item nameLong test item nameLong test item name';
      const shortenItemName =
        'Long test item nameLong test item nameLong test item nameLong test item nameLong test item nameLong test item nameLong test item nameLong test item nameLong test item nameLong test item nameLong test item nameLong test item nameLong test item nameLong test...';

      expect(formatItemName(longItemName)).toBe(shortenItemName);
    });
  });
});
