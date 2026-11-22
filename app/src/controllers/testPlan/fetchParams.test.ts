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

import { getTestPlanDetailsFetchParams } from './fetchParams';

describe('getTestPlanDetailsFetchParams', () => {
  test('uses the folder, page and search of the test plan details URL', () => {
    expect(
      getTestPlanDetailsFetchParams({
        location: {
          payload: {
            organizationSlug: 'org',
            projectSlug: 'proj',
            testPlanId: '5',
            testPlanRoute: 'folder/12',
          },
          query: { offset: '100', limit: '50', testCasesSearchParams: 'login' },
        },
      }),
    ).toEqual({
      testPlanId: '5',
      folderId: '12',
      offset: '100',
      limit: '50',
      testCasesSearchParams: 'login',
    });
  });

  test('defaults to the test case page size, not the plan list one', () => {
    expect(
      getTestPlanDetailsFetchParams({
        location: { payload: { organizationSlug: 'org', projectSlug: 'proj', testPlanId: '5' } },
      }),
    ).toEqual(expect.objectContaining({ folderId: undefined, offset: 0, limit: 50 }));
  });

  test('returns null outside the test plan details page', () => {
    expect(
      getTestPlanDetailsFetchParams({
        location: { payload: { organizationSlug: 'org', projectSlug: 'proj' } },
      }),
    ).toBeNull();
  });
});
