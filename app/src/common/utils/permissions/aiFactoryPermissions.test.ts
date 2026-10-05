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

import { UserRoles, OrganizationRoles, ProjectRoles } from 'types/roles';
import {
  canReviewAiTestCases,
  canAutomateTestCases,
  canManagePipelineSettings,
} from './permissions';

const roles = (
  userRole: UserRoles,
  organizationRole: OrganizationRoles,
  projectRole: ProjectRoles,
) => ({ userRole, organizationRole, projectRole });

describe('AI Factory permissions (F15)', () => {
  test('instance ADMINISTRATOR can do everything, regardless of project/org role', () => {
    const userRoles = roles('ADMINISTRATOR', 'MEMBER', 'VIEWER');

    expect(canReviewAiTestCases(userRoles)).toBe(true);
    expect(canAutomateTestCases(userRoles)).toBe(true);
    expect(canManagePipelineSettings(userRoles)).toBe(true);
  });

  test('org MANAGER can do everything even with project VIEWER (Q-BE-10)', () => {
    const userRoles = roles('USER', 'MANAGER', 'VIEWER');

    expect(canReviewAiTestCases(userRoles)).toBe(true);
    expect(canAutomateTestCases(userRoles)).toBe(true);
    expect(canManagePipelineSettings(userRoles)).toBe(true);
  });

  test('project EDITOR can review and automate, but not manage pipeline settings', () => {
    const userRoles = roles('USER', 'MEMBER', 'EDITOR');

    expect(canReviewAiTestCases(userRoles)).toBe(true);
    expect(canAutomateTestCases(userRoles)).toBe(true);
    expect(canManagePipelineSettings(userRoles)).toBe(false);
  });

  test('project VIEWER can do none of the AI Factory actions', () => {
    const userRoles = roles('USER', 'MEMBER', 'VIEWER');

    expect(canReviewAiTestCases(userRoles)).toBe(false);
    expect(canAutomateTestCases(userRoles)).toBe(false);
    expect(canManagePipelineSettings(userRoles)).toBe(false);
  });
});
