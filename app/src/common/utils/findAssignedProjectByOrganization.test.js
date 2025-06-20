/*
 * Copyright 2024 EPAM Systems
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

import { findAssignedProjectByOrganization } from './findAssignedProjectByOrganization';

describe('findAssignedProjectByOrganization', () => {
  const superadminPersonal = {
    projectRole: 'EDITOR',
    entryType: null,
    projectKey: 'superadmin_personal',
    projectSlug: 'superadmin-personal',
    projectName: 'superadmin_personal',
    organizationId: 1,
  };
  const assignedProjects = {
    superadminPersonal,
  };
  test('should find assigned project', () => {
    expect(findAssignedProjectByOrganization(assignedProjects, 1, 'superadmin-personal')).toEqual(
      superadminPersonal,
    );
  });

  test("shouldn't find assigned project", () => {
    expect(findAssignedProjectByOrganization(assignedProjects, 2, 'superadmin-personal')).toEqual(
      undefined,
    );
  });

  test("shouldn't find assigned project", () => {
    expect(findAssignedProjectByOrganization(assignedProjects, 1, 'superadmin-personal-2')).toEqual(
      undefined,
    );
  });
});
