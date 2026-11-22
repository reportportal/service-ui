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

import {
  getManagerPasswordError,
  getPasswordAttributeError,
  hasStoredManagerPassword,
  hasStoredPasswordAttribute,
  isUrlChanged,
  prepareLdapFormData,
  MANAGER_PASSWORD_REQUIRED_ON_URL_CHANGE_ERROR,
  PASSWORD_ATTRIBUTE_REQUIRED_ON_URL_CHANGE_ERROR,
} from './ldapFormHelpers';
import { applyIntegrationFormPrepare } from '../../integrationFormPrepareMap';

const stored = {
  url: 'ldap://old.example.com',
  baseDn: 'dc=example,dc=com',
  managerDn: 'cn=admin,dc=example,dc=com',
  passwordEncoderType: '',
  email: 'mail',
};
const storedWithEncoder = { ...stored, passwordEncoderType: 'SHA' };
const anonymous = { ...stored, managerDn: '' };

const managerError = (initialData, values, value = '', isEdit = true) =>
  getManagerPasswordError({ value, isEdit, initialData, values });

describe('ldapFormHelpers', () => {
  describe('stored-secret signals and url comparison', () => {
    it('treats a manager DN at load time as "a manager password is stored"', () => {
      expect(hasStoredManagerPassword(stored)).toBe(true);
      expect(hasStoredManagerPassword(anonymous)).toBe(false);
      expect(hasStoredManagerPassword({ managerDn: '  ' })).toBe(false);
      expect(hasStoredManagerPassword(undefined)).toBe(false);
    });

    it('treats an encoder at load time as "a password attribute is stored"', () => {
      expect(hasStoredPasswordAttribute(storedWithEncoder)).toBe(true);
      expect(hasStoredPasswordAttribute(stored)).toBe(false);
    });

    it('compares the url ignoring padding', () => {
      expect(isUrlChanged(stored, { ...stored, url: ' ldap://old.example.com ' })).toBe(false);
      expect(isUrlChanged(stored, { ...stored, url: 'ldaps://old.example.com' })).toBe(true);
      expect(isUrlChanged(stored, { ...stored, url: 'ldap://new.example.com' })).toBe(true);
    });
  });

  describe('manager password', () => {
    it('(a) url unchanged, password untouched: passes', () => {
      expect(managerError(stored, { ...stored, baseDn: 'dc=other' })).toBeUndefined();
    });

    it('(b) url changed, password untouched: required with the explaining hint', () => {
      expect(managerError(stored, { ...stored, url: 'ldap://new.example.com' })).toBe(
        MANAGER_PASSWORD_REQUIRED_ON_URL_CHANGE_ERROR,
      );
      expect(managerError(stored, { ...stored, url: 'ldap://new.example.com' }, '   ')).toBe(
        MANAGER_PASSWORD_REQUIRED_ON_URL_CHANGE_ERROR,
      );
    });

    it('(c) url changed, password typed: passes', () => {
      expect(
        managerError(stored, { ...stored, url: 'ldap://new.example.com' }, 'secret'),
      ).toBeUndefined();
    });

    it('anonymous bind (no manager DN): never required', () => {
      expect(
        managerError(anonymous, { ...anonymous, url: 'ldap://new.example.com' }),
      ).toBeUndefined();
    });

    it('manager DN cleared in the form while the url changes: not required (anonymous bind)', () => {
      const changed = { ...stored, managerDn: '', url: 'ldap://new.example.com' };
      expect(managerError(stored, changed)).toBeUndefined();
      expect(managerError(stored, { ...changed, managerDn: '   ' })).toBeUndefined();
      expect(managerError(stored, { ...changed, managerDn: 'cn=admin' })).toBe(
        MANAGER_PASSWORD_REQUIRED_ON_URL_CHANGE_ERROR,
      );
    });

    it('(d) create: never required', () => {
      expect(managerError(undefined, { url: 'ldap://new.example.com' }, '', false)).toBeUndefined();
      expect(
        managerError(stored, { ...stored, url: 'ldap://new.example.com' }, '', false),
      ).toBeUndefined();
    });
  });

  describe('password attribute', () => {
    const changed = { ...storedWithEncoder, url: 'ldap://new.example.com' };
    const attributeError = (initialData, values, value = '') =>
      getPasswordAttributeError({ value, isEdit: true, initialData, values });

    it('is required when the url changes and an encoder was and still is set', () => {
      expect(attributeError(storedWithEncoder, changed)).toBe(
        PASSWORD_ATTRIBUTE_REQUIRED_ON_URL_CHANGE_ERROR,
      );
    });

    it('passes when typed, when the url is unchanged, or when the encoder is now "NO"', () => {
      expect(attributeError(storedWithEncoder, changed, 'userPassword')).toBeUndefined();
      expect(attributeError(storedWithEncoder, storedWithEncoder)).toBeUndefined();
      expect(
        attributeError(storedWithEncoder, { ...changed, passwordEncoderType: '' }),
      ).toBeUndefined();
    });

    it('passes when no encoder was set at load time', () => {
      expect(
        attributeError(stored, {
          ...stored,
          url: 'ldap://new.example.com',
          passwordEncoderType: 'SHA',
        }),
      ).toBeUndefined();
    });
  });

  describe('prepareLdapFormData', () => {
    it('(a) leaves an untouched edit without secret keys', () => {
      const values = { ...stored, nameType: 'fullName' };
      expect(prepareLdapFormData(values, stored)).toEqual(values);
    });

    it('(c) keeps a typed manager password and a typed password attribute', () => {
      const values = {
        ...storedWithEncoder,
        url: 'ldap://new.example.com',
        managerPassword: 'secret',
        passwordAttribute: 'userPassword',
      };
      expect(prepareLdapFormData(values, storedWithEncoder)).toEqual(values);
    });

    it('drops blank secrets so a stray blank key never names a secret to the server', () => {
      const prepared = prepareLdapFormData(
        { ...stored, managerPassword: '', passwordAttribute: '  ' },
        stored,
      );
      expect(prepared).not.toHaveProperty('managerPassword');
      expect(prepared).not.toHaveProperty('passwordAttribute');
    });

    it('sends a blank passwordAttribute only when the encoder was set and is now "NO"', () => {
      const cleared = { ...storedWithEncoder, passwordEncoderType: '' };
      expect(prepareLdapFormData(cleared, storedWithEncoder)).toHaveProperty(
        'passwordAttribute',
        '',
      );
      // encoder still set, attribute left blank: keep the stored one
      expect(prepareLdapFormData(storedWithEncoder, storedWithEncoder)).not.toHaveProperty(
        'passwordAttribute',
      );
      // encoder was never set: nothing to clear
      expect(prepareLdapFormData(stored, stored)).not.toHaveProperty('passwordAttribute');
    });

    it('(d) create: no initial data, blanks dropped, nothing added', () => {
      const values = {
        url: 'ldap://x',
        baseDn: 'dc=x',
        managerPassword: '',
        passwordEncoderType: '',
      };
      expect(prepareLdapFormData(values, undefined)).toEqual({
        url: 'ldap://x',
        baseDn: 'dc=x',
        passwordEncoderType: '',
      });
    });

    it('is registered for the ldap plugin in the prepare map', () => {
      expect(
        applyIntegrationFormPrepare(
          'ldap',
          { ...storedWithEncoder, passwordEncoderType: '' },
          storedWithEncoder,
        ),
      ).toHaveProperty('passwordAttribute', '');
    });
  });
});
