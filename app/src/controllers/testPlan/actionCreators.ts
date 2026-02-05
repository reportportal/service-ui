/*
 * Copyright 2025 EPAM Systems
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

import { GET_TEST_PLANS, GET_TEST_PLAN } from './constants';

export interface GetTestPlansParams {
  offset?: string | number;
  limit?: string | number;
}

export interface GetTestPlanParams {
  testPlanId: string | number;
  folderId?: string | number;
  offset?: string | number;
  limit?: string | number;
}

export const getTestPlansAction = (params?: GetTestPlansParams) => ({
  type: GET_TEST_PLANS,
  payload: params,
});

export const getTestPlanAction = (params: GetTestPlanParams) => ({
  type: GET_TEST_PLAN,
  payload: params,
});
