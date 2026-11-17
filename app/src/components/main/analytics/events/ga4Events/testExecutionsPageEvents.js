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

import { getBasicClickEventParameters } from '../common/ga4Utils';

const TEST_EXECUTIONS_CATEGORY = 'test_executions';

export const TEST_EXECUTIONS_PROMO_EVENTS = {
  CLICK_START_SEARCHING: {
    ...getBasicClickEventParameters(TEST_EXECUTIONS_CATEGORY),
    element_name: 'start_searching',
    place: 'page_test_executions_without_plugin',
  },

  CLICK_EXPLORE_PLANS_POPUP: {
    ...getBasicClickEventParameters(TEST_EXECUTIONS_CATEGORY),
    type: 'test_executions_page',
    element_name: 'explore_plans',
    place: 'premium_features_popup',
  },

  CLICK_NOT_NOW_POPUP: {
    ...getBasicClickEventParameters(TEST_EXECUTIONS_CATEGORY),
    type: 'test_executions_page',
    element_name: 'not_now',
    place: 'premium_features_popup',
  },

  CLICK_CONTACT_US_POPUP: {
    ...getBasicClickEventParameters(TEST_EXECUTIONS_CATEGORY),
    type: 'test_executions_page',
    element_name: 'start_contact_us_tep',
    place: 'premium_features_popup',
  },

  clickPromoLink: (linkName) => ({
    ...getBasicClickEventParameters(TEST_EXECUTIONS_CATEGORY),
    link_name: linkName,
    place: 'page_test_executions_without_plugin',
  }),
};
