/*
 * Copyright 2025 EPAM Systems
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
  isString,
  capitalize,
  stringEqual,
  compareStringsLocale,
  parseSentences,
  stripEmojis,
} from './stringUtils';

describe('isString', () => {
  test('should return true for string values', () => {
    expect(isString('hello')).toBe(true);
    expect(isString('')).toBe(true);
    expect(isString('123')).toBe(true);
    expect(isString('true')).toBe(true);
  });

  test('should return false for non-string values', () => {
    expect(isString(123)).toBe(false);
    expect(isString(true)).toBe(false);
    expect(isString(false)).toBe(false);
    expect(isString(null)).toBe(false);
    expect(isString(undefined)).toBe(false);
    expect(isString({})).toBe(false);
    expect(isString([])).toBe(false);
    expect(isString(() => {})).toBe(false);
  });
});

describe('capitalize', () => {
  test('should capitalize first letter and lowercase the rest', () => {
    expect(capitalize('hello')).toBe('Hello');
    expect(capitalize('WORLD')).toBe('World');
    expect(capitalize('test')).toBe('Test');
    expect(capitalize('a')).toBe('A');
    expect(capitalize('hELLo')).toBe('Hello');
    expect(capitalize('TeSt')).toBe('Test');
    expect(capitalize('MiXeD')).toBe('Mixed');
  });

  test('should return original value for non-string inputs', () => {
    expect(capitalize(123)).toBe(123);
    expect(capitalize(true)).toBe(true);
    expect(capitalize(false)).toBe(false);
    expect(capitalize(null)).toBe(null);
    expect(capitalize(undefined)).toBe(undefined);
    expect(capitalize({})).toEqual({});
    expect(capitalize([])).toEqual([]);
  });
});

describe('compareStringsLocale', () => {
  test('should sort strings in locale order when used as Array.sort comparator', () => {
    expect(['b', 'a', 'c'].sort(compareStringsLocale)).toEqual(['a', 'b', 'c']);
  });
});

describe('stringEqual', () => {
  test('should return true for equal string values', () => {
    expect(stringEqual('hello', 'hello')).toBe(true);
    expect(stringEqual('123', '123')).toBe(true);
    expect(stringEqual('', '')).toBe(true);
  });

  test('should return false for different string values', () => {
    expect(stringEqual('hello', 'world')).toBe(false);
    expect(stringEqual('123', '456')).toBe(false);
    expect(stringEqual('test', 'TEST')).toBe(false);
  });

  test('should handle type coercion for numbers', () => {
    expect(stringEqual(123, '123')).toBe(true);
    expect(stringEqual('123', 123)).toBe(true);
    expect(stringEqual(123, 123)).toBe(true);
    expect(stringEqual(456, '123')).toBe(false);
  });

  test('should handle edge cases', () => {
    expect(stringEqual(null, 'null')).toBe(true);
    expect(stringEqual(undefined, 'undefined')).toBe(true);
    expect(stringEqual(true, 'true')).toBe(true);
    expect(stringEqual(false, 'false')).toBe(true);
  });
});

describe('parseSentences', () => {
  test('should split by sentence-ending punctuation and newlines', () => {
    expect(parseSentences('Hello. World!\nHow are you?')).toEqual([
      'Hello.',
      'World!',
      'How are you?',
    ]);
  });

  test('should keep version numbers as one sentence', () => {
    expect(parseSentences('Version 26.0.5 is live. Read more here.')).toEqual([
      'Version 26.0.5 is live.',
      'Read more here.',
    ]);
  });

  test('should trim parts and drop empty ones', () => {
    expect(parseSentences('  Hello.   \n\n  World!  ')).toEqual(['Hello.', 'World!']);
  });
});

describe('stripEmojis', () => {
  test('should remove emojis and normalize whitespace', () => {
    expect(stripEmojis('  Hello 👋  world 🎉  ')).toBe('Hello world');
  });

  test('should remove consecutive and mixed emojis', () => {
    expect(stripEmojis('Launch 🚀🚀✅ done')).toBe('Launch done');
    expect(stripEmojis('👍👍👍')).toBe('');
    expect(stripEmojis('Hi 😀😃😄!')).toBe('Hi !');
  });

  test('should remove flag and keycap sequences', () => {
    expect(stripEmojis('Hello 🇺🇸 world')).toBe('Hello world');
    expect(stripEmojis('Score 1️⃣5️⃣')).toBe('Score');
    expect(stripEmojis('Tags #️⃣ *️⃣')).toBe('Tags');
  });

  test('should keep plain letters and digits', () => {
    expect(stripEmojis('Hello US')).toBe('Hello US');
    expect(stripEmojis('Version 5 #1 *2')).toBe('Version 5 #1 *2');
  });
});
