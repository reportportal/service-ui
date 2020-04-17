import { createUiExtensionSelectorByType } from './selectors';
import { uiExtensionMap } from './uiExtensionStorage';

describe('plugins/uiExtension/selectors', () => {
  beforeEach(() => {
    uiExtensionMap.clear();
  });

  describe('createUiExtensionSelectorByType', () => {
    test('should return a function', () => {
      expect(createUiExtensionSelectorByType('page')).toBeInstanceOf(Function);
    });

    test('created selector should return an empty array in case of no items found', () => {
      const selector = createUiExtensionSelectorByType('tab').resultFunc;
      expect(selector(['name'])).toEqual([]);
      uiExtensionMap.set('name', [{ type: 'tab' }]);
      expect(selector([])).toEqual([]);
    });

    test('created selector should return all enabled extensions filtered by type', () => {
      uiExtensionMap.set('name', [{ type: 'tab' }, { type: 'page' }, { type: 'tab' }]);
      const selector = createUiExtensionSelectorByType('tab').resultFunc;
      expect(selector(['name'])).toEqual([{ type: 'tab' }, { type: 'tab' }]);
    });
  });

  afterAll(() => {
    uiExtensionMap.clear();
  });
});
