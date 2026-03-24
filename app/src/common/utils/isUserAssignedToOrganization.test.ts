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

import { AssignedOrganizations } from 'controllers/user/types';
import { isUserAssignedToOrganization } from './isUserAssignedToOrganization';

describe('isUserAssignedToOrganization', () => {
  const assignedOrganizations: AssignedOrganizations = {
    first: {
      organizationId: 1,
      organizationName: 'First',
      organizationRole: 'MANAGER',
      organizationSlug: 'first',
    },
    second: {
      organizationId: 2,
      organizationName: 'Second',
      organizationRole: 'MEMBER',
      organizationSlug: 'second',
    },
  };

  test('returns true when the user is assigned to the organization', () => {
    expect(isUserAssignedToOrganization(assignedOrganizations, 2)).toBe(true);
  });

  test('returns false when the user is not assigned to the organization', () => {
    expect(isUserAssignedToOrganization(assignedOrganizations, 3)).toBe(false);
  });

  test('returns false when organization id is missing', () => {
    expect(isUserAssignedToOrganization(assignedOrganizations)).toBe(false);
  });
});
