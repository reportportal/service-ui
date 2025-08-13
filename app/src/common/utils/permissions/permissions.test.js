/*
 * Copyright 2019 EPAM Systems
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

import { createCheckPermission } from './permissions';

const PERMISSIONS_MAP = {
  ADMINISTRATOR: {
    CREATE_USER: 'OWNER',
  },
  MANAGER: {
    CREATE_USER: 'ALL',
  },
  MEMBER: {
    EDITOR: {
      CREATE_USER: 'OWNER',
    },
  },
};
const checkPermission = createCheckPermission(PERMISSIONS_MAP);
const canCreateUser = checkPermission('CREATE_USER');

describe('permissions', () => {
  it('should return true if user has ADMINISTRATOR role', () => {
    expect(canCreateUser({ userRole: 'ADMINISTRATOR' })).toBeTruthy();
  });
  it('should return false if there is NO such project role', () => {
    expect(canCreateUser({ userRole: 'USER', projectRole: 'NEW_ROLE' })).toBeFalsy();
  });
  it("should return false if user hasn't got permission", () => {
    expect(canCreateUser({ userRole: 'USER', organizationRole: 'PROJECT_MANAGER' })).toBeFalsy();
  });
  it('should return true if user has MANAGER role', () => {
    expect(canCreateUser({ userRole: 'USER', organizationRole: 'MANAGER' })).toBeTruthy();
  });
});
