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

import { getConfirmEmailUuid } from './emailConfirmation';

describe('getConfirmEmailUuid', () => {
  test('reads the uuid from a plain query', () => {
    expect(getConfirmEmailUuid({ confirmEmail: 'abc-123' })).toBe('abc-123');
  });

  test('reads the uuid from a router action', () => {
    expect(getConfirmEmailUuid({ type: 'LOGIN_PAGE', meta: { query: { confirmEmail: 'u1' } } })).toBe(
      'u1',
    );
    expect(getConfirmEmailUuid({ type: 'LOGIN_PAGE', query: { confirmEmail: 'u2' } })).toBe('u2');
  });

  test('returns an empty string when the parameter is absent or invalid', () => {
    expect(getConfirmEmailUuid(undefined)).toBe('');
    expect(getConfirmEmailUuid({})).toBe('');
    expect(getConfirmEmailUuid({ type: 'LOGIN_PAGE', meta: {} })).toBe('');
    expect(getConfirmEmailUuid({ reset: 'x' })).toBe('');
    expect(getConfirmEmailUuid({ confirmEmail: '' })).toBe('');
    expect(getConfirmEmailUuid({ confirmEmail: '  ' })).toBe('');
    expect(getConfirmEmailUuid({ confirmEmail: ['a', 'b'] })).toBe('');
  });
});
