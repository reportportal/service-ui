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

import { SET_TOKEN, LOGIN_SUCCESS } from 'controllers/auth/constants';
import { SHOW_MODAL } from 'controllers/modal/constants';
import { SECRET_FIELDS_KEY } from 'controllers/plugins/constants';
import { actionSanitizer, stateSanitizer } from './actionSanitizer';

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

describe('actionSanitizer for tokens, API keys and integration secrets', () => {
  test.each([SET_TOKEN, LOGIN_SUCCESS])('redacts the token value of %s', (type) => {
    const action = { type, payload: { type: 'Bearer', value: 'jwt-value' } };

    expect(actionSanitizer(action).payload).toEqual({ type: 'Bearer', value: '[redacted]' });
    expect(action.payload.value).toBe('jwt-value');
  });

  test('redacts a generated API key shown in a modal', () => {
    const action = { type: SHOW_MODAL, payload: { id: 'apiKeyModal', data: { apiKey: 'key' } } };

    expect(actionSanitizer(action).payload.data).toEqual({ apiKey: '[redacted]' });
  });

  test('redacts nested integration secrets by key and by the secret fields meta list', () => {
    const action = {
      type: 'addIntegration',
      payload: {
        data: {
          name: 'jira',
          integrationParameters: {
            url: 'https://jira.example.com',
            password: 'p',
            accessToken: 'a',
            clientSecret: 'c',
            managerPassword: 'm',
            oauthAccessKey: 'o',
            apiToken: 't',
            customSecret: 's',
          },
        },
      },
      meta: { [SECRET_FIELDS_KEY]: ['customSecret'] },
    };

    expect(actionSanitizer(action).payload.data.integrationParameters).toEqual({
      url: 'https://jira.example.com',
      password: '[redacted]',
      accessToken: '[redacted]',
      clientSecret: '[redacted]',
      managerPassword: '[redacted]',
      oauthAccessKey: '[redacted]',
      apiToken: '[redacted]',
      customSecret: '[redacted]',
    });
  });

  test('redacts the OAuth token in a route action query and location meta', () => {
    const action = {
      type: 'OAUTH_SUCCESS',
      payload: { query: { token: 'jwt', token_type: 'bearer' } },
      meta: { location: { current: { query: { token: 'jwt' } } } },
    };
    const sanitized = actionSanitizer(action);

    expect(sanitized.payload.query).toEqual({ token: '[redacted]', token_type: 'bearer' });
    expect(sanitized.meta.location.current.query.token).toBe('[redacted]');
  });

  test('keeps empty secret values as they are', () => {
    const action = { type: 'LOGIN', payload: { login: 'admin', password: '' } };

    expect(actionSanitizer(action)).toBe(action);
  });
});

describe('actionSanitizer for repeated references and cycles', () => {
  test('redacts a secret-bearing object referenced from two payload paths', () => {
    const shared = { password: 'secret' };
    const action = {
      type: 'X',
      payload: { first: shared, second: shared, list: [shared, shared] },
    };
    const { payload } = actionSanitizer(action);

    expect(payload.first.password).toBe('[redacted]');
    expect(payload.second.password).toBe('[redacted]');
    expect(payload.list[1].password).toBe('[redacted]');
    expect(shared.password).toBe('secret');
  });

  test('redacts secrets inside a cycle and keeps the cycle', () => {
    const node = { name: 'n', password: 'secret' };
    node.self = node;
    const sanitized = actionSanitizer({ type: 'X', payload: node }).payload;

    expect(sanitized.password).toBe('[redacted]');
    expect(sanitized.self.password).toBe('[redacted]');
    expect(sanitized.self).toBe(sanitized);
    expect(node.password).toBe('secret');
  });

  test('keeps the same reference for a shared object without secrets', () => {
    const shared = { a: 1 };
    const action = { type: 'X', payload: { first: shared, second: shared } };

    expect(actionSanitizer(action)).toBe(action);
  });
});

describe('actionSanitizer for redux-form field actions', () => {
  test.each(['@@redux-form/CHANGE', '@@redux-form/BLUR'])(
    'redacts the value of a secret field in %s',
    (type) => {
      const action = { type, payload: 'secret', meta: { form: 'login', field: 'password' } };

      expect(actionSanitizer(action).payload).toBe('[redacted]');
      expect(action.payload).toBe('secret');
    },
  );

  test('matches the last segment of a nested field path', () => {
    const action = {
      type: '@@redux-form/CHANGE',
      payload: 'secret',
      meta: { form: 'f', field: 'integrationParameters.apiKey' },
    };

    expect(actionSanitizer(action).payload).toBe('[redacted]');
  });

  test('redacts fields listed in the secret fields meta', () => {
    const action = {
      type: '@@redux-form/CHANGE',
      payload: 'secret',
      meta: { field: 'custom', [SECRET_FIELDS_KEY]: ['custom'] },
    };

    expect(actionSanitizer(action).payload).toBe('[redacted]');
  });

  test('keeps the value of a non-secret field', () => {
    const action = { type: '@@redux-form/CHANGE', payload: 'jira', meta: { field: 'name' } };

    expect(actionSanitizer(action)).toBe(action);
  });
});

describe('stateSanitizer', () => {
  test('blanks the auth token and secrets in forms, modals and the location', () => {
    const state = {
      auth: { authorized: true, token: { type: 'Bearer', value: 'jwt' } },
      form: {
        jiraIntegration: {
          values: { url: 'https://jira.example.com', password: 'p' },
          initial: { password: 'p' },
        },
      },
      modal: { activeModal: { id: 'apiKeyModal', data: { apiKey: 'key' } } },
      location: { query: { token: 'jwt' } },
      launches: { items: [{ id: 1 }] },
    };
    const sanitized = stateSanitizer(state);

    expect(sanitized.auth).toEqual({ authorized: true, token: '[redacted]' });
    expect(sanitized.form.jiraIntegration).toEqual({
      values: { url: 'https://jira.example.com', password: '[redacted]' },
      initial: { password: '[redacted]' },
    });
    expect(sanitized.modal.activeModal.data.apiKey).toBe('[redacted]');
    expect(sanitized.location.query.token).toBe('[redacted]');
    expect(sanitized.launches).toBe(state.launches);
    expect(state.auth.token.value).toBe('jwt');
  });

  test('redacts the LDAP password attribute in form state', () => {
    const state = {
      form: { ldap: { values: { url: 'ldap://x', passwordAttribute: 'userPassword' } } },
    };

    expect(stateSanitizer(state).form.ldap.values).toEqual({
      url: 'ldap://x',
      passwordAttribute: '[redacted]',
    });
  });

  test('returns the same state when there is nothing to redact', () => {
    const state = { auth: { authorized: false }, form: {}, launches: {} };

    expect(stateSanitizer(state)).toBe(state);
  });
});
