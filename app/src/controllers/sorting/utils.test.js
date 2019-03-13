import { parseSortingString, formatSortingString } from './utils';

describe('sorting/utils', () => {
  describe('parseSortingString', () => {
    test('should return object fith empty fields and direction for empty string', () => {
      expect(parseSortingString('')).toEqual({
        fields: [],
        direction: null,
      });
    });

    test('should parse sorting string to an object with fields and direction', () => {
      expect(parseSortingString('number,DESC')).toEqual({
        fields: ['number'],
        direction: 'DESC',
      });
      expect(parseSortingString('number,ASC')).toEqual({
        fields: ['number'],
        direction: 'ASC',
      });
    });

    test('should handle multiple fields', () => {
      expect(parseSortingString('number,date,DESC')).toEqual({
        fields: ['number', 'date'],
        direction: 'DESC',
      });
      expect(parseSortingString('number,date,ASC')).toEqual({
        fields: ['number', 'date'],
        direction: 'ASC',
      });
    });

    test('should set direction to null if no direction provided', () => {
      expect(parseSortingString('number')).toEqual({
        fields: ['number'],
        direction: null,
      });
      expect(parseSortingString('number,date')).toEqual({
        fields: ['number', 'date'],
        direction: null,
      });
    });

    test('should set fields to an empty array if no fields provided', () => {
      expect(parseSortingString('DESC')).toEqual({
        fields: [],
        direction: 'DESC',
      });
      expect(parseSortingString('ASC')).toEqual({
        fields: [],
        direction: 'ASC',
      });
    });
  });

  describe('formatSortingString', () => {
    test('should return empty string if no arguments present', () => {
      expect(formatSortingString()).toBe('');
    });

    test('should return string containing fields and direction', () => {
      expect(formatSortingString(['number'], 'DESC')).toBe('number,DESC');
      expect(formatSortingString(['number', 'date'], 'DESC')).toBe('number,date,DESC');
    });

    test('should return string containing fields only in case no direction', () => {
      expect(formatSortingString(['number', 'date'])).toBe('number,date');
    });

    test('should return string containing direction in case no fields', () => {
      expect(formatSortingString([], 'DESC')).toBe('DESC');
    });
  });
});
