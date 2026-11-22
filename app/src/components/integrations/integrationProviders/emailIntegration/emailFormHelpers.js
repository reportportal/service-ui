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

import { combineNameAndEmailToFrom } from 'common/utils/fieldTransformer';
import { AUTH_ENABLED_KEY, HOST_KEY, PORT_KEY, PROTOCOL_KEY, PASSWORD_KEY } from './constants';

export const PASSWORD_REQUIRED_ERROR = 'requiredFieldHint';
export const PASSWORD_REQUIRED_ON_TARGET_CHANGE_ERROR = 'emailPasswordRequiredOnTargetChangeHint';

const TARGET_KEYS = [HOST_KEY, PORT_KEY, PROTOCOL_KEY];

export const isAuthOn = (value) => value === true || value === 'true';

const isBlank = (value) => value === undefined || value === null || `${value}`.trim() === '';

const normalizeTargetValue = (value) => (isBlank(value) ? '' : `${value}`.trim());

// The API never returns the password. The only signal that one is stored is that authentication
// was enabled when the integration was loaded: the server keeps a password only with auth on,
// and switching auth off blanks it. Limit: an integration saved with auth on and an empty
// password (legacy data) is indistinguishable from one with a real password.
export const hasStoredPassword = (initialData) => isAuthOn(initialData?.[AUTH_ENABLED_KEY]);

export const isTargetChanged = (initialData, values) =>
  TARGET_KEYS.some(
    (key) => normalizeTargetValue(initialData?.[key]) !== normalizeTargetValue(values?.[key]),
  );

// An empty password is acceptable in edit mode only when one is stored and will be kept, which
// the server does only while host, port and protocol stay the same.
export const canKeepStoredPassword = ({ editAuthMode, initialData, values }) =>
  Boolean(editAuthMode) && hasStoredPassword(initialData) && !isTargetChanged(initialData, values);

export const getPasswordError = ({ value, editAuthMode, initialData, values }) => {
  if (!isBlank(value)) {
    return undefined;
  }
  if (canKeepStoredPassword({ editAuthMode, initialData, values })) {
    return undefined;
  }
  return editAuthMode && hasStoredPassword(initialData) && isTargetChanged(initialData, values)
    ? PASSWORD_REQUIRED_ON_TARGET_CHANGE_ERROR
    : PASSWORD_REQUIRED_ERROR;
};

// With auth on, a blank password is not sent at all (validation lets it through only when a stored
// one is kept), so the server keeps the stored value. With auth off the blank username and
// password are sent on purpose, which clears the stored credentials.
export const prepareEmailFormData = (formData) => {
  const prepared = combineNameAndEmailToFrom(formData);
  if (isAuthOn(prepared[AUTH_ENABLED_KEY]) && isBlank(prepared[PASSWORD_KEY])) {
    delete prepared[PASSWORD_KEY];
  }
  return prepared;
};
