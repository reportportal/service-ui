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

import * as validatorHelpers from './validatorHelpers';

describe('trimValue', () => {
  test(' value should not contain spaces in the end and in the begin', () => {
    expect(validatorHelpers.trimValue('   a b c   ')).toBe('a b c');
    expect(validatorHelpers.trimValue('a b c   ')).toBe('a b c');
    expect(validatorHelpers.trimValue('   a b c')).toBe('a b c');
    expect(validatorHelpers.trimValue('  ')).toBe('');
  });
});

describe('isEmpty', () => {
  test('validation should be correct', () => {
    expect(validatorHelpers.isEmpty('')).toBe(true);
    expect(validatorHelpers.isEmpty('   ')).toBe(true);
    expect(validatorHelpers.isEmpty(null)).toBe(true);
    expect(validatorHelpers.isEmpty(undefined)).toBe(true);
  });
  test('validation should be not correct', () => {
    expect(validatorHelpers.isEmpty(' abc ')).toBe(false);
    expect(validatorHelpers.isEmpty(123)).toBe(false);
    expect(validatorHelpers.isEmpty(0)).toBe(false);
    expect(validatorHelpers.isEmpty(false)).toBe(false);
  });
});

describe('isNotEmpty', () => {
  test('validation should be correct', () => {
    expect(validatorHelpers.isNotEmpty(' abc ')).toBe(true);
    expect(validatorHelpers.isNotEmpty(123)).toBe(true);
    expect(validatorHelpers.isNotEmpty(0)).toBe(true);
    expect(validatorHelpers.isNotEmpty(false)).toBe(true);
  });
  test('validation should be not correct', () => {
    expect(validatorHelpers.isNotEmpty('')).toBe(false);
    expect(validatorHelpers.isNotEmpty('   ')).toBe(false);
    expect(validatorHelpers.isNotEmpty(null)).toBe(false);
    expect(validatorHelpers.isNotEmpty(undefined)).toBe(false);
  });
});

describe('isNotOnlySpaces', () => {
  test('validation should be correct', () => {
    expect(validatorHelpers.isNotOnlySpaces(' abc ')).toBe(true);
    expect(validatorHelpers.isNotOnlySpaces('123')).toBe(true);
    expect(validatorHelpers.isNotOnlySpaces('')).toBe(true);
    expect(validatorHelpers.isNotOnlySpaces(null)).toBe(true);
    expect(validatorHelpers.isNotOnlySpaces(undefined)).toBe(true);
  });
  test('validation should be not correct', () => {
    expect(validatorHelpers.isNotOnlySpaces('   ')).toBe(false);
  });
});

describe('range', () => {
  test('validation should be correct', () => {
    expect(validatorHelpers.range(3, 55)(5)).toBe(true);
    expect(validatorHelpers.range(3, 55)('5')).toBe(true);
  });
  test('Validation should not be correct', () => {
    expect(validatorHelpers.range(3, 55)(2)).toBe(false);
    expect(validatorHelpers.range(3, 55)('2')).toBe(false);
  });
});

describe('min', () => {
  test('validation should be correct', () => {
    expect(validatorHelpers.min(3)(3)).toBe(true);
    expect(validatorHelpers.min(3)(10)).toBe(true);
    expect(validatorHelpers.min(3)('10')).toBe(true);
  });
  test('Validation should not be correct', () => {
    expect(validatorHelpers.min(3)(2)).toBe(false);
    expect(validatorHelpers.min(3)('2')).toBe(false);
  });
});

describe('max', () => {
  test('validation should be correct', () => {
    expect(validatorHelpers.max(10)(10)).toBe(true);
    expect(validatorHelpers.max(10)(3)).toBe(true);
    expect(validatorHelpers.max(10)('10')).toBe(true);
  });
  test('Validation should not be correct', () => {
    expect(validatorHelpers.max(10)(22)).toBe(false);
    expect(validatorHelpers.max(10)('22')).toBe(false);
  });
});

describe('minLength', () => {
  test('validation should be correct', () => {
    expect(validatorHelpers.minLength(3)('text')).toBe(true);
    expect(validatorHelpers.minLength(3)(['1', '2', '3'])).toBe(true);
  });
  test('Validation should not be correct', () => {
    expect(validatorHelpers.minLength(3)('      ')).toBe(false);
    expect(validatorHelpers.minLength(3)('t')).toBe(false);
    expect(validatorHelpers.minLength(3)('  t   ')).toBe(false);
    expect(validatorHelpers.minLength(3)(['1'])).toBe(false);
  });
});

describe('maxLength', () => {
  test('validation should be correct', () => {
    expect(validatorHelpers.maxLength(5)('text')).toBe(true);
    expect(validatorHelpers.maxLength(5)([1])).toBe(true);
  });
  test('Validation should not be correct', () => {
    expect(validatorHelpers.maxLength(5)('this is long text')).toBe(false);
    expect(validatorHelpers.maxLength(5)([1, 2, 3, 4, 5, 6])).toBe(false);
  });
});

describe('lengthRange', () => {
  test('validation should be correct', () => {
    expect(validatorHelpers.lengthRange(3, 10)('short text')).toBe(true);
    expect(validatorHelpers.lengthRange(3, 10)(['1', '2', '3'])).toBe(true);
  });
  test('Validation should not be correct', () => {
    expect(validatorHelpers.lengthRange(3, 10)('a')).toBe(false);
    expect(validatorHelpers.lengthRange(3, 10)('   a   ')).toBe(false);
    expect(validatorHelpers.lengthRange(3, 10)('')).toBe(false);
    expect(validatorHelpers.lengthRange(3, 10)('this text is longer than 10')).toBe(false);
    expect(validatorHelpers.lengthRange(3, 10)(['1'])).toBe(false);
  });
});

describe('regex', () => {
  test('validation should be correct', () => {
    expect(validatorHelpers.regex(/^[0-9]+$/)('123')).toBe(true);
    expect(validatorHelpers.regex(/^[0-9]+$/)(123)).toBe(true);
  });
  test('Validation should not be correct', () => {
    expect(validatorHelpers.regex(/^[0-9]+$/)('abc')).toBe(false);
  });
});

describe('composeValidators', () => {
  const composedValidator = validatorHelpers.composeValidators([
    validatorHelpers.isNotEmpty,
    validatorHelpers.lengthRange(3, 5),
  ]);
  test('validation should be correct', () => {
    expect(composedValidator('123')).toBe(true);
    expect(composedValidator('abcde')).toBe(true);
  });
  test('Validation should not be correct', () => {
    expect(composedValidator(null)).toBe(false);
    expect(composedValidator('    ')).toBe(false);
    expect(composedValidator('12')).toBe(false);
    expect(composedValidator('123456')).toBe(false);
  });
});

describe('bindMessageToValidator', () => {
  const bindedValidator = validatorHelpers.bindMessageToValidator(
    validatorHelpers.isNotEmpty,
    'error message',
  );
  test('validator should return error message', () => {
    expect(bindedValidator(null)).toBe('error message');
    expect(bindedValidator('   ')).toBe('error message');
  });
  test('validator should return undefined', () => {
    expect(bindedValidator('1234')).toBe(undefined);
    expect(bindedValidator(12)).toBe(undefined);
  });
});

describe('composeBoundValidators', () => {
  const bindedValidator1 = validatorHelpers.bindMessageToValidator(
    validatorHelpers.isNotEmpty,
    'value is required',
  );
  const bindedValidator2 = validatorHelpers.bindMessageToValidator(
    validatorHelpers.range(3, 5),
    'value should be between 3 and 5',
  );
  const composedBindedValidator = validatorHelpers.composeBoundValidators([
    bindedValidator1,
    bindedValidator2,
  ]);
  test('validator should return undefined', () => {
    expect(composedBindedValidator(4)).toBe(undefined);
  });
  test('validator should return error message', () => {
    expect(composedBindedValidator(null)).toBe('value is required');
    expect(composedBindedValidator(10)).toBe('value should be between 3 and 5');
  });
});
