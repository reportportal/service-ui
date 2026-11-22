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
  getPasswordError,
  hasStoredPassword,
  isTargetChanged,
  prepareEmailFormData,
  PASSWORD_REQUIRED_ERROR,
  PASSWORD_REQUIRED_ON_TARGET_CHANGE_ERROR,
} from './emailFormHelpers';

const stored = {
  host: 'smtp.example.com',
  port: 587,
  protocol: 'smtp',
  authEnabled: true,
  username: 'user',
};
// What the form holds right after initialize() in edit mode (password initialised to '').
const editForm = { ...stored, password: '', fromName: 'RP', fromEmail: 'a@b.com' };

describe('emailFormHelpers', () => {
  describe('hasStoredPassword / isTargetChanged', () => {
    it('treats auth enabled at load time as "a password is stored"', () => {
      expect(hasStoredPassword({ authEnabled: true })).toBe(true);
      expect(hasStoredPassword({ authEnabled: 'true' })).toBe(true);
      expect(hasStoredPassword({ authEnabled: false })).toBe(false);
      expect(hasStoredPassword(undefined)).toBe(false);
    });

    it('compares host, port and protocol ignoring number/string type and padding', () => {
      expect(isTargetChanged(stored, { ...stored, port: '587', host: ' smtp.example.com ' })).toBe(
        false,
      );
      expect(isTargetChanged(stored, { ...stored, host: 'other.example.com' })).toBe(true);
      expect(isTargetChanged(stored, { ...stored, port: '25' })).toBe(true);
      expect(isTargetChanged(stored, { ...stored, protocol: 'smtps' })).toBe(true);
    });
  });

  describe('(a) edit, auth on, password untouched, other field changed', () => {
    const values = { ...editForm, fromEmail: 'new@b.com' };

    it('passes validation', () => {
      expect(
        getPasswordError({ value: '', editAuthMode: true, initialData: stored, values }),
      ).toBeUndefined();
    });

    it('does not send the password key at all', () => {
      const payload = prepareEmailFormData(values);
      expect(payload).not.toHaveProperty('password');
      expect(payload.from).toBe('RP <new@b.com>');
      expect(payload.username).toBe('user');
    });
  });

  describe('(b) edit, auth on, new password typed', () => {
    const values = { ...editForm, password: 'new-secret' };

    it('passes validation', () => {
      expect(
        getPasswordError({ value: 'new-secret', editAuthMode: true, initialData: stored, values }),
      ).toBeUndefined();
    });

    it('sends the typed password', () => {
      expect(prepareEmailFormData(values).password).toBe('new-secret');
    });
  });

  describe('(c) edit, auth switched off', () => {
    const values = { ...editForm, authEnabled: false, username: '', password: '' };

    it('sends blank username and password', () => {
      const payload = prepareEmailFormData(values);
      expect(payload.authEnabled).toBe(false);
      expect(payload.username).toBe('');
      expect(payload.password).toBe('');
    });
  });

  describe('(d) edit, host changed, password untouched', () => {
    const values = { ...editForm, host: 'new.example.com' };

    it('requires the password with an explanatory message', () => {
      expect(getPasswordError({ value: '', editAuthMode: true, initialData: stored, values })).toBe(
        PASSWORD_REQUIRED_ON_TARGET_CHANGE_ERROR,
      );
    });

    it('accepts the host change once the password is re-entered', () => {
      const withPassword = { ...values, password: 'again' };
      expect(
        getPasswordError({
          value: 'again',
          editAuthMode: true,
          initialData: stored,
          values: withPassword,
        }),
      ).toBeUndefined();
      expect(prepareEmailFormData(withPassword).password).toBe('again');
    });
  });

  describe('edit, auth was off and is switched on', () => {
    const initialData = { ...stored, authEnabled: false, username: '' };
    const values = { ...initialData, authEnabled: true, username: 'u', password: '' };

    it('requires a password because none is stored', () => {
      expect(getPasswordError({ value: '', editAuthMode: true, initialData, values })).toBe(
        PASSWORD_REQUIRED_ERROR,
      );
    });
  });

  describe('(e) create', () => {
    const values = { host: 'h', port: '25', protocol: 'smtp', authEnabled: true, username: 'u' };

    it('requires the password', () => {
      expect(getPasswordError({ value: '', editAuthMode: false, initialData: {}, values })).toBe(
        PASSWORD_REQUIRED_ERROR,
      );
    });

    it('sends the typed password', () => {
      expect(prepareEmailFormData({ ...values, password: 'pw' }).password).toBe('pw');
    });

    it('with auth off sends the blank defaults unchanged', () => {
      const payload = prepareEmailFormData({
        ...values,
        authEnabled: false,
        username: '',
        password: '',
      });
      expect(payload.password).toBe('');
      expect(payload.username).toBe('');
    });
  });
});
