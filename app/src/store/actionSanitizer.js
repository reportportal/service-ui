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

// Credentials the user types travel as an action payload to the saga that sends them, and the
// DevTools enhancer is wired in production too (log-only). The extension would otherwise keep
// them in its action history, so they are replaced before it ever sees the action. This feeds
// the devtools stream only — reducers and sagas still receive the real payload.
const SECRET_PAYLOAD_FIELDS = ['password', 'privateKey'];

export const actionSanitizer = (action) => {
  const secrets = SECRET_PAYLOAD_FIELDS.filter((field) => action?.payload?.[field]);

  if (secrets.length === 0) {
    return action;
  }

  return {
    ...action,
    payload: {
      ...action.payload,
      ...Object.fromEntries(secrets.map((field) => [field, '[redacted]'])),
    },
  };
};
