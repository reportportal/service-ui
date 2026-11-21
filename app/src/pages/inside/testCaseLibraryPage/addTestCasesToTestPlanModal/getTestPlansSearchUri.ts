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

import { URLS } from 'common/urls';

const TEST_PLANS_PAGE_SIZE = 50;
// The API reads the `sort` query parameter and sorts by the TmsTestPlan criterion name.
const TEST_PLANS_SORT = 'createdAt,desc';

export const getTestPlansSearchUri = (projectKey: string, search: string) =>
  URLS.testPlan(projectKey, {
    'filter.ex.milestoneId': true,
    ...(search ? { 'filter.cnt.name': search } : {}),
    limit: TEST_PLANS_PAGE_SIZE,
    offset: 0,
    sort: TEST_PLANS_SORT,
  });
