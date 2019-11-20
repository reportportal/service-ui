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

import { createNamespacedActionPredicate } from './createNamespacedActionPredicate';

describe('createNamespacedActionPredicate', () => {
  test('should return false for incompatible action type', () => {
    const namespace = 'namespace2';
    expect(
      createNamespacedActionPredicate(namespace, ['type1'])({ meta: { namespace }, type: 'type2' }),
    ).toBe(false);
  });

  test('should return false for incompatible action namespace', () => {
    const type = 'type1';
    expect(
      createNamespacedActionPredicate('namespace1', [type])({
        meta: { namespace: 'namespace2' },
        type,
      }),
    ).toBe(false);
  });

  test('should return false for empty actionTypes', () => {
    const type = 'type1';
    expect(createNamespacedActionPredicate('namespace2')({ type })).toBe(false);
  });

  test('should return undefined for action without any namespace', () => {
    const type = 'type1';
    expect(createNamespacedActionPredicate('namespace2', [type])({ type })).toBe(undefined);
  });

  test('should return true for action with correct namespace and type', () => {
    const type = 'type1';
    const namespace = 'namespace1';
    expect(createNamespacedActionPredicate(namespace, [type])({ type, meta: { namespace } })).toBe(
      true,
    );
  });
});
