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

import {
  attributeFormatter,
  getAttributeValue,
  getUniqueAndCommonAttributes,
  parseQueryAttributes,
} from './attributeUtils';

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
  describe('attributeFormatter', () => {
    test('should return an empty string if no arguments specified', () => {
      expect(attributeFormatter()).toBe('');
    });
    test('should return an empty string if no key and value specified', () => {
      expect(attributeFormatter({})).toBe('');
    });
    test('should return formatted value if both key and value specified', () => {
      expect(attributeFormatter({ key: 'foo', value: 'bar' }, ':')).toBe('foo:bar');
    });
    test('should return formatted value if only key specified', () => {
      expect(attributeFormatter({ key: 'foo' }, ':')).toBe('foo:');
    });
    test('should return formatted value if only value specified', () => {
      expect(attributeFormatter({ value: 'bar' }, ':')).toBe('bar');
    });
  });
  describe('parseQueryAttributes', () => {
    test('should return an empty array if object value property is empty', () => {
      const value = {
        condition: 'has',
        filteringField: 'compositeAttribute',
        value: '',
      };
      expect(parseQueryAttributes(value)).toEqual([]);
    });
    test('should return an array with attribute (with value and empty key) if object value property contains only attribute value', () => {
      const value = {
        condition: 'has',
        filteringField: 'compositeAttribute',
        value: 'justAttrValue',
      };
      const result = [
        {
          key: '',
          value: 'justAttrValue',
        },
      ];
      expect(parseQueryAttributes(value)).toEqual(result);
    });
    test('should return an array with attribute if object value property contains only one attribute', () => {
      const value = {
        condition: 'has',
        filteringField: 'compositeAttribute',
        value: 'key:value',
      };
      const result = [
        {
          key: 'key',
          value: 'value',
        },
      ];
      expect(parseQueryAttributes(value)).toEqual(result);
    });
    test('should return an array of attributes if object value property contains several attributes', () => {
      const value = {
        condition: 'has',
        filteringField: 'compositeAttribute',
        value: 'key1:value1,key2:,value3',
      };
      const result = [
        {
          key: 'key1',
          value: 'value1',
        },
        {
          key: 'key2',
          value: '',
        },
        {
          key: '',
          value: 'value3',
        },
      ];
      expect(parseQueryAttributes(value)).toEqual(result);
    });
  });
  describe('getUniqueAndCommonAttributes', () => {
    test('should return only common attributes', () => {
      const items = [
        {
          attributes: [
            { key: 'key', value: 'value' },
            { key: 'key2', value: 'value2' },
          ],
        },
        {
          attributes: [
            { key: 'key', value: 'value' },
            { key: 'key2', value: 'value2' },
          ],
        },
      ];
      const result = {
        common: [
          { key: 'key', value: 'value' },
          { key: 'key2', value: 'value2' },
        ],
        unique: [],
      };
      expect(getUniqueAndCommonAttributes(items)).toEqual(result);
    });
    test('should return only unique attributes', () => {
      const items = [
        {
          attributes: [
            { key: 'key1', value: 'value1' },
            { key: 'key2', value: 'value2' },
          ],
        },
        {
          attributes: [
            { key: 'key3', value: 'value3' },
            { key: 'key4', value: 'value4' },
          ],
        },
      ];
      const result = {
        common: [],
        unique: [
          { key: 'key1', value: 'value1' },
          { key: 'key2', value: 'value2' },
          { key: 'key3', value: 'value3' },
          { key: 'key4', value: 'value4' },
        ],
      };
      expect(getUniqueAndCommonAttributes(items)).toEqual(result);
    });
    test('should return one common and one unique attribute', () => {
      const items = [
        {
          attributes: [
            { key: 'key', value: 'value' },
            { key: 'key1', value: 'value1' },
          ],
        },
        {
          attributes: [
            { key: 'key', value: 'value' },
            { key: 'key2', value: 'value2' },
          ],
        },
        { attributes: [{ key: 'key', value: 'value' }] },
      ];
      const result = {
        common: [{ key: 'key', value: 'value' }],
        unique: [
          { key: 'key1', value: 'value1' },
          { key: 'key2', value: 'value2' },
        ],
      };
      expect(getUniqueAndCommonAttributes(items)).toEqual(result);
    });
  });
});
