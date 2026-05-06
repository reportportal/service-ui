/*
 * Copyright 2026 EPAM Systems
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

import { trimStringValues } from './objectUtils';

describe('trimStringValues', () => {
  test('should trim string values', () => {
    const input = {
      name: '  Alice  ',
      email: ' test@example.com ',
      note: 'ok',
    };

    expect(trimStringValues(input)).toEqual({
      name: 'Alice',
      email: 'test@example.com',
      note: 'ok',
    });
  });

  test('should keep non-string values intact', () => {
    const input = {
      count: 10,
      active: true,
      meta: { key: ' value ' },
      items: ['  a  ', 'b'],
      nullable: null,
      undef: undefined,
    };

    expect(trimStringValues(input)).toEqual(input);
  });

  test('should not mutate input object', () => {
    const input = { name: '  Bob  ' };

    const result = trimStringValues(input);

    expect(result).toEqual({ name: 'Bob' });
    expect(input).toEqual({ name: '  Bob  ' });
  });
});
