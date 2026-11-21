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

import { canOverrideDashboardLock } from './lockedDashboardAccess';

describe('canOverrideDashboardLock', () => {
  const editor = { userRole: 'USER', organizationRole: 'MEMBER', userId: 'editor' };

  test('is allowed for the owner', () => {
    expect(canOverrideDashboardLock({ ...editor, owner: 'editor' })).toBe(true);
  });

  test('is allowed for an organization manager who is not the owner', () => {
    expect(
      canOverrideDashboardLock({ ...editor, organizationRole: 'MANAGER', owner: 'someone' }),
    ).toBe(true);
  });

  test('is allowed for an instance administrator who is not the owner', () => {
    expect(canOverrideDashboardLock({ ...editor, userRole: 'ADMINISTRATOR', owner: 'someone' })).toBe(
      true,
    );
  });

  test('is refused for a project editor who is not the owner', () => {
    expect(canOverrideDashboardLock({ ...editor, owner: 'someone' })).toBe(false);
  });

  test('is refused when the owner or the current user is unknown', () => {
    expect(canOverrideDashboardLock({ ...editor, owner: undefined })).toBe(false);
    expect(canOverrideDashboardLock({ userRole: 'USER', owner: 'someone' })).toBe(false);
    expect(canOverrideDashboardLock({ userRole: 'USER', owner: '' , userId: ''})).toBe(false);
  });
});
