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
