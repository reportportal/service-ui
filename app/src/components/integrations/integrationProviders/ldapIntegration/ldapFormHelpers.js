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

import { isBlank, isAnyTargetChanged } from 'components/integrations/integrationTargetHelpers';
import {
  MANAGER_DN_KEY,
  MANAGER_PASSWORD_KEY,
  PASSWORD_ATTRIBUTE_KEY,
  PASSWORD_ENCODER_TYPE_KEY,
  URL_KEY,
} from './constants';

export const MANAGER_PASSWORD_REQUIRED_ON_URL_CHANGE_ERROR =
  'ldapManagerPasswordRequiredOnUrlChangeHint';
export const PASSWORD_ATTRIBUTE_REQUIRED_ON_URL_CHANGE_ERROR =
  'ldapPasswordAttributeRequiredOnUrlChangeHint';

const TARGET_KEYS = [URL_KEY];

// The API never returns managerPassword. A manager DN set at load time is the only signal that one
// is stored: the directory is bound as that manager. Limits: a manager DN saved without a password
// is indistinguishable from one with a password (the user is asked for it needlessly), and a
// password stored without a manager DN (not a working configuration) is not detected.
export const hasStoredManagerPassword = (initialData) => !isBlank(initialData?.[MANAGER_DN_KEY]);

// passwordAttribute is hidden by the API too. The password encoder type is returned and the
// attribute is only used with an encoder, so an encoder set at load time means one is stored.
export const hasStoredPasswordAttribute = (initialData) =>
  !isBlank(initialData?.[PASSWORD_ENCODER_TYPE_KEY]);

export const isUrlChanged = (initialData, values) =>
  isAnyTargetChanged(TARGET_KEYS, initialData, values);

// An empty manager password is fine in edit mode while the stored one is kept, which the server
// does only while the url stays the same. Anonymous bind never needs one: that is the case when no
// manager DN is stored, and also when the user has cleared the current manager DN.
export const getManagerPasswordError = ({ value, isEdit, initialData, values }) =>
  isBlank(value) &&
  Boolean(isEdit) &&
  hasStoredManagerPassword(initialData) &&
  !isBlank(values?.[MANAGER_DN_KEY]) &&
  isUrlChanged(initialData, values)
    ? MANAGER_PASSWORD_REQUIRED_ON_URL_CHANGE_ERROR
    : undefined;

// The same for the password attribute, which the field shows only while an encoder is selected.
export const getPasswordAttributeError = ({ value, isEdit, initialData, values }) =>
  isBlank(value) &&
  Boolean(isEdit) &&
  hasStoredPasswordAttribute(initialData) &&
  !isBlank(values?.[PASSWORD_ENCODER_TYPE_KEY]) &&
  isUrlChanged(initialData, values)
    ? PASSWORD_ATTRIBUTE_REQUIRED_ON_URL_CHANGE_ERROR
    : undefined;

// A blank sensitive value is sent only on purpose: the server treats any sensitive key in the
// request, even a blank one, as "the secrets are named", so a stray blank one would silently drop
// the stored manager password on a url change instead of rejecting the request. The one deliberate
// blank is clearing the password attribute: the encoder was set when loaded and is now "NO".
// redux-form drops an emptied field that had no initial value, so the blank has to be put back.
export const prepareLdapFormData = (formData, initialData) => {
  const prepared = { ...formData };
  if (isBlank(prepared[MANAGER_PASSWORD_KEY])) {
    delete prepared[MANAGER_PASSWORD_KEY];
  }
  if (isBlank(prepared[PASSWORD_ATTRIBUTE_KEY])) {
    delete prepared[PASSWORD_ATTRIBUTE_KEY];
    if (hasStoredPasswordAttribute(initialData) && isBlank(prepared[PASSWORD_ENCODER_TYPE_KEY])) {
      prepared[PASSWORD_ATTRIBUTE_KEY] = '';
    }
  }
  return prepared;
};
