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

import { fileSizeConverter } from './fileSizeConverter';

describe('fileSizeConverter', () => {
  test('should return string', () => {
    expect(typeof fileSizeConverter(123456)).toBe('string');
  });
  test('Should return 1b if input number equals 1', () => {
    expect(fileSizeConverter(1)).toEqual('1b');
  });
  test('Should return 99b if input number equals 99', () => {
    expect(fileSizeConverter(99)).toEqual('99b');
  });
  test('Should return 0.1KB if input number equals 101', () => {
    expect(fileSizeConverter(101)).toEqual('0.1KB');
  });
  test('Should return 1KB if input number equals 1000', () => {
    expect(fileSizeConverter(1000)).toEqual('1KB');
  });
  test('Should return 1MB if input number equals 1000000', () => {
    expect(fileSizeConverter(1000000)).toEqual('1MB');
  });
  test('Should return 1GB if input number equals 1000000000', () => {
    expect(fileSizeConverter(1000000000)).toEqual('1GB');
  });
  test('Should return 1TB if input number equals 1000000000000', () => {
    expect(fileSizeConverter(1000000000000)).toEqual('1TB');
  });
  test('Should return 0b if input number equals 0', () => {
    expect(fileSizeConverter(0)).toEqual('0b');
  });
  test('Should throw an error if input is not numeric', () => {
    expect(() => {
      fileSizeConverter('string');
    }).toThrow('You should provide positive integer or zero for this function');
  });
  test('Should throw an error if input number is negative', () => {
    expect(() => {
      fileSizeConverter(-140);
    }).toThrow('You should provide positive integer or zero for this function');
  });
});
