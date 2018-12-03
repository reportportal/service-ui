import { formatAttribute, getAttributeValue } from './attributeUtils';

describe('attributeUtils', () => {
  describe('getAttributeValue', () => {
    test('should return undefined if no arguments specified', () => {
      expect(() => {
        getAttributeValue();
      }).not.toThrow();
      expect(getAttributeValue()).toBe(undefined);
    });
    test('should return undefined if the argument is an epmty object', () => {
      expect(getAttributeValue()).toBe(undefined);
    });
    test('should return key if only key is present', () => {
      expect(getAttributeValue({ key: 'foo' })).toBe('foo');
    });
    test('should return value if only value specified', () => {
      expect(getAttributeValue({ value: 'foo' })).toBe('foo');
    });
    test('should return value if both key and value present', () => {
      expect(getAttributeValue({ key: 'foo', value: 'bar' })).toBe('bar');
    });
  });
  describe('formatAttribute', () => {
    test('should return an empty string if no arguments specified', () => {
      expect(formatAttribute()).toBe('');
    });
    test('should return formatted value if both key and value specified', () => {
      expect(formatAttribute({ key: 'foo', value: 'bar' })).toBe('foo:bar');
    });
  });
});
