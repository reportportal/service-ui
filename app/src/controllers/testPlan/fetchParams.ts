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

import { getRouterParams } from 'common/utils/getRouterParams';
import type { LocationInfo } from 'controllers/pages/typed-selectors';

import type { GetTestPlanParams } from './actionCreators';
import { defaultTestPlanTestCasesQueryParams, TEST_PLAN_TEST_CASES_NAMESPACE } from './constants';

type TestPlanDetailsState = Parameters<typeof getRouterParams>[0]['state'] & {
  location?: LocationInfo;
};

// The same parameters the test plan details route uses: active plan, folder, page and search
// from the URL. Returns null outside the test plan details page.
export const getTestPlanDetailsFetchParams = (
  state: TestPlanDetailsState,
): GetTestPlanParams | null => {
  const testPlanId = state.location?.payload?.testPlanId;

  if (!testPlanId) {
    return null;
  }

  const folderId = state.location?.payload?.testPlanRoute?.match(/folder\/(\d+)/)?.[1];
  const { offset, limit } = getRouterParams({
    namespace: TEST_PLAN_TEST_CASES_NAMESPACE,
    defaultParams: defaultTestPlanTestCasesQueryParams,
    state,
  });

  return {
    testPlanId,
    folderId,
    offset,
    limit,
    testCasesSearchParams: state.location?.query?.testCasesSearchParams,
  };
};
