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
import { SECRET_FIELDS_KEY } from 'controllers/plugins/constants';

// Credentials and tokens travel in action payloads (login, integration forms, generated API keys,
// the OAuth redirect query) and live in the auth and redux-form state, and the DevTools enhancer is
// wired in production too (log-only). The extension would otherwise keep them in its history, so
// they are replaced before it ever sees an action or a state. This feeds the devtools stream only:
// reducers and sagas still receive the real values.
export const REDACTED = '[redacted]';

const SECRET_KEYS = new Set(
  [
    'password',
    'privateKey',
    'accessToken',
    'clientSecret',
    'managerPassword',
    'oauthAccessKey',
    'apiToken',
    'apiKey',
    'token',
  ].map((key) => key.toLowerCase()),
);
const TOKEN_ACTIONS = [SET_TOKEN, LOGIN_SUCCESS];
const SANITIZED_STATE_SLICES = ['auth', 'form', 'modal', 'location'];

const isPlainObject = (value) => {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

// Returns the same reference when nothing had to be redacted.
const redact = (value, extraKeys, seen = new WeakSet()) => {
  if (Array.isArray(value)) {
    if (seen.has(value)) {
      return value;
    }
    seen.add(value);
    let changed = false;
    const result = value.map((item) => {
      const redacted = redact(item, extraKeys, seen);
      changed = changed || redacted !== item;
      return redacted;
    });
    return changed ? result : value;
  }
  if (!isPlainObject(value) || seen.has(value)) {
    return value;
  }
  seen.add(value);
  let result = value;
  Object.keys(value).forEach((key) => {
    const item = value[key];
    const isSecret = SECRET_KEYS.has(key.toLowerCase()) || extraKeys.has(key);
    let redacted;
    if (isSecret) {
      redacted = item === undefined || item === null || item === '' ? item : REDACTED;
    } else {
      redacted = redact(item, extraKeys, seen);
    }
    if (redacted !== item) {
      if (result === value) {
        result = { ...value };
      }
      result[key] = redacted;
    }
  });
  return result;
};

export const actionSanitizer = (action) => {
  if (!action) {
    return action;
  }

  const secretFields = action.meta?.[SECRET_FIELDS_KEY];
  const extraKeys = new Set(Array.isArray(secretFields) ? secretFields : []);
  const sanitized = redact(action, extraKeys);

  if (TOKEN_ACTIONS.includes(action.type) && sanitized.payload) {
    return {
      ...sanitized,
      payload: isPlainObject(sanitized.payload)
        ? { ...sanitized.payload, value: REDACTED }
        : REDACTED,
    };
  }

  return sanitized;
};

export const stateSanitizer = (state) => {
  if (!isPlainObject(state)) {
    return state;
  }

  const emptyKeys = new Set();
  let result = state;
  SANITIZED_STATE_SLICES.forEach((slice) => {
    const sanitized = redact(state[slice], emptyKeys);
    if (sanitized !== state[slice]) {
      if (result === state) {
        result = { ...state };
      }
      result[slice] = sanitized;
    }
  });
  return result;
};
