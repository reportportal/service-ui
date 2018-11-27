import { normalizeAttributesWithPrefix } from './utils';

describe('project/utils', () => {
  const prefix = 'prefix';
  const attributes = {
    numberOfLogLines: '3',
  };
  const normalizedAttributes = {
    [`${prefix}.numberOfLogLines`]: '3',
  };
  describe('normalizeAttributesWithPrefix', () => {
    test('should return an empty object if case of empty arguments', () => {
      expect(normalizeAttributesWithPrefix({}, '')).toEqual({});
      expect(normalizeAttributesWithPrefix({}, prefix)).toEqual({});
    });
    test('should return the same object if case of no prefix', () => {
      expect(normalizeAttributesWithPrefix(attributes)).toEqual(attributes);
    });
    test('should return object containing attribute keys with the corresponding prefix', () => {
      expect(normalizeAttributesWithPrefix(attributes, prefix)).toEqual(normalizedAttributes);
    });
  });
});
