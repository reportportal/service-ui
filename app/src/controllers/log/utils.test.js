import { getPreviousItem, getNextItem } from './utils';

describe('log/utils', () => {
  const itemsArray = [{ id: 0 }, { id: 1 }, { id: 2 }];
  describe('getPreviousItem', () => {
    test('should return null in case of item array length < 2', () => {
      expect(getPreviousItem([], 1)).toBe(null);
      expect(getPreviousItem([{ id: 1 }], 1)).toBe(null);
    });
    test('should return null if the first item is active', () => {
      expect(getPreviousItem(itemsArray, 0)).toBe(null);
    });
    test('should return item if active item index > 0', () => {
      expect(getPreviousItem(itemsArray, 1)).toEqual({ id: 0 });
      expect(getPreviousItem(itemsArray, 2)).toEqual({ id: 1 });
    });
  });
  describe('getNextItem', () => {
    test('should return null in case of item array length <= 1', () => {
      expect(getNextItem([], 0)).toBe(null);
      expect(getNextItem([{ id: 0 }, 0])).toBe(null);
    });
    test('should return null if the last item is active', () => {
      expect(getNextItem(itemsArray, 2)).toBe(null);
    });
    test('should return item if active item is not last', () => {
      expect(getNextItem(itemsArray, 0)).toEqual({ id: 1 });
      expect(getNextItem(itemsArray, 1)).toEqual({ id: 2 });
    });
  });
});
