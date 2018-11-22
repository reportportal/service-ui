import { normalizeAttributesWithPrefix } from './utils';
import { ANALYZER_ATTRIBUTE_PREFIX } from './constants';

describe('project/utils', () => {
  const attributes = {
    numberOfLogLines: '3',
  };
  const normalizedAttributes = {
    [`${ANALYZER_ATTRIBUTE_PREFIX}.numberOfLogLines`]: '3',
  };
  describe('normalizeAttributesWithPrefix', () => {
    test('should return {} in case of attributes object is empty', () => {
      expect(normalizeAttributesWithPrefix({}, '')).toEqual({});
      expect(normalizeAttributesWithPrefix({}, ANALYZER_ATTRIBUTE_PREFIX)).toEqual({});
    });
    test('should return normalized attributes object if attributes provided', () => {
      expect(normalizeAttributesWithPrefix(attributes, ANALYZER_ATTRIBUTE_PREFIX)).toEqual(
        normalizedAttributes,
      );
    });
  });
});
