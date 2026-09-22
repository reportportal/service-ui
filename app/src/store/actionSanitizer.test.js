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

import { actionSanitizer } from './actionSanitizer';

describe('actionSanitizer', () => {
  test('replaces the marketplace licence key before DevTools records it', () => {
    const action = {
      type: 'SET_MARKETPLACE_LICENCE',
      payload: { customerId: 'acme', privateKey: 'super-secret-key' },
    };

    expect(actionSanitizer(action).payload).toEqual({
      customerId: 'acme',
      privateKey: '[redacted]',
    });
  });

  test('replaces the login password the same way', () => {
    const action = { type: 'LOGIN', payload: { login: 'admin', password: 'hunter2' } };

    expect(actionSanitizer(action).payload).toEqual({ login: 'admin', password: '[redacted]' });
  });

  test('leaves the action untouched when it carries no credential', () => {
    const action = { type: 'FETCH_MARKETPLACE_CATALOGUE', payload: { q: 'jira' } };

    expect(actionSanitizer(action)).toBe(action);
  });

  test('survives actions with no payload at all', () => {
    const action = { type: 'LOGOUT' };

    expect(actionSanitizer(action)).toBe(action);
  });
});
