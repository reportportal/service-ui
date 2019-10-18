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

import { omit } from './omit';

describe('utils/omit', () => {
  test('should return a new object', () => {
    const oldObject = { foo: 3, bar: 4 };
    expect(omit(oldObject, ['foo'])).not.toBe(oldObject);
  });

  test('should return empty object in case of no arguments', () => {
    expect(() => omit()).not.toThrow();
    expect(omit()).toEqual({});
  });

  test('should not modify incoming arguments', () => {
    const oldObject = { foo: 3, bar: 4 };
    const keys = ['foo'];
    omit(oldObject, keys);
    expect(oldObject).toEqual({ foo: 3, bar: 4 });
    expect(keys).toEqual(['foo']);
  });

  test('should return object without excluded keys', () => {
    const oldObject = { foo: 3, bar: 4, baz: 'baz' };
    expect(omit(oldObject, ['foo'])).toEqual({ bar: 4, baz: 'baz' });
  });
});
