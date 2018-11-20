import { canGoBackSelector, canGoForwardSelector } from './selectors';

describe('log/selectors', () => {
  const itemsArray = [{ id: 0 }, { id: 1 }, { id: 2 }];
  describe('canGoBackSelector', () => {
    test('should return false in case of item array length < 2', () => {
      expect(canGoBackSelector.resultFunc([], 1)).toBe(false);
      expect(canGoBackSelector.resultFunc([{ id: 1 }], 1)).toBe(false);
    });
    test('should return false if the first item is active', () => {
      expect(canGoBackSelector.resultFunc(itemsArray, 0)).toBe(false);
    });
    test('should return true if active item index > 0', () => {
      expect(canGoBackSelector.resultFunc(itemsArray, 1)).toBe(true);
      expect(canGoBackSelector.resultFunc(itemsArray, 2)).toBe(true);
    });
  });
  describe('canGoForwardSelector', () => {
    test('should return false in case of item array length <= 1', () => {
      expect(canGoForwardSelector.resultFunc([], 0)).toBe(false);
      expect(canGoForwardSelector.resultFunc([{ id: 0 }, 0])).toBe(false);
    });
    test('should return false if the last item is active', () => {
      expect(canGoForwardSelector.resultFunc(itemsArray, 2)).toBe(false);
    });
    test('should return true if active item is not last', () => {
      expect(canGoForwardSelector.resultFunc(itemsArray, 0)).toBe(true);
      expect(canGoForwardSelector.resultFunc(itemsArray, 1)).toBe(true);
    });
  });
});
