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

import { isSoleLdapAuth } from './utils';

describe('isSoleLdapAuth', () => {
  test('returns true when authExtensions has only LDAP', () => {
    expect(isSoleLdapAuth({ ldap: { button: 'LDAP', path: '/ldap' } })).toBe(true);
    expect(isSoleLdapAuth({ LDAP: { button: 'LDAP' } })).toBe(true);
  });

  test('returns false when authExtensions is empty', () => {
    expect(isSoleLdapAuth()).toBe(false);
    expect(isSoleLdapAuth({})).toBe(false);
  });

  test('returns false when sole provider is not LDAP', () => {
    expect(isSoleLdapAuth({ github: { path: '/github' } })).toBe(false);
    expect(isSoleLdapAuth({ saml: { path: '/saml' } })).toBe(false);
  });

  test('returns false when LDAP is one of multiple providers', () => {
    expect(
      isSoleLdapAuth({
        ldap: { button: 'LDAP' },
        github: { path: '/github' },
      }),
    ).toBe(false);
  });
});
