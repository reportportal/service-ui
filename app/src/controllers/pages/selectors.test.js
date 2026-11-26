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

import { activeProjectRoleSelector } from './selectors';

describe('activeProjectRoleSelector', () => {
  const assignedOrganizations = {
    orga: { organizationId: 1 },
    orgb: { organizationId: 2 },
  };
  const assignedProjects = {
    a_demo: { projectSlug: 'demo', organizationId: 1, projectRole: 'EDITOR' },
    b_demo: { projectSlug: 'demo', organizationId: 2, projectRole: 'VIEWER' },
  };
  const resolve = (orgSlug, projectSlug) =>
    activeProjectRoleSelector.resultFunc(
      orgSlug,
      projectSlug,
      assignedOrganizations,
      assignedProjects,
    );

  it('resolves the role of the organization from the URL when slugs collide', () => {
    expect(resolve('orga', 'demo')).toBe('EDITOR');
    expect(resolve('orgb', 'demo')).toBe('VIEWER');
  });

  it('returns undefined for an unknown organization or project', () => {
    expect(resolve('orgc', 'demo')).toBeUndefined();
    expect(resolve('orga', 'other')).toBeUndefined();
  });
});
