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

import { mapProjectsWithAssignedRoles } from './mapProjectsWithAssignedRoles';

describe('mapProjectsWithAssignedRoles', () => {
  const currentProject = { key: 'org-a.demo', slug: 'demo', name: 'Demo A' };

  test('does not use a role from another organization with the same project slug', () => {
    const assignedProjects = {
      'org-b.demo': {
        projectRole: 'EDITOR',
        projectKey: 'org-b.demo',
        projectSlug: 'demo',
        organizationId: 2,
      },
    };

    expect(mapProjectsWithAssignedRoles([currentProject], assignedProjects)).toEqual([
      { ...currentProject, role: undefined },
    ]);
  });

  test('uses the role stored under the current project key', () => {
    const assignedProjects = {
      'org-b.demo': {
        projectRole: 'VIEWER',
        projectKey: 'org-b.demo',
        projectSlug: 'demo',
        organizationId: 2,
      },
      'org-a.demo': {
        projectRole: 'EDITOR',
        projectKey: 'org-a.demo',
        projectSlug: 'demo',
        organizationId: 1,
      },
    };

    expect(mapProjectsWithAssignedRoles([currentProject], assignedProjects)[0].role).toBe('EDITOR');
  });

  test('leaves the role empty when the user has no assignments', () => {
    expect(mapProjectsWithAssignedRoles([currentProject])[0].role).toBeUndefined();
  });
});
