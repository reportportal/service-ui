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

const ORG_DASHBOARD_CATEGORY = 'organization_dashboard';
const ORG_DASHBOARD_TYPE = 'organization_dashboard';
const EMPTY_STATE_WITHOUT_PLUGIN = 'empty_state_organization_dashboard_without_plugin';
const PREMIUM_FEATURES_POPUP = 'premium_features_popup';

const BASIC_EVENT_PARAMETERS = getBasicClickEventParameters(ORG_DASHBOARD_CATEGORY);

export const ORGANIZATION_DASHBOARDS_PROMO_EVENTS = {
  CLICK_EXPLORE_PLANS_POPUP: {
    ...BASIC_EVENT_PARAMETERS,
    type: ORG_DASHBOARD_TYPE,
    element_name: 'explore_plans',
    place: PREMIUM_FEATURES_POPUP,
  },

  CLICK_NOT_NOW_POPUP: {
    ...BASIC_EVENT_PARAMETERS,
    type: ORG_DASHBOARD_TYPE,
    element_name: 'not_now',
    place: PREMIUM_FEATURES_POPUP,
  },

  CLICK_CONTACT_US_POPUP: {
    ...BASIC_EVENT_PARAMETERS,
    type: ORG_DASHBOARD_TYPE,
    element_name: 'start_contact_us_odb',
    place: PREMIUM_FEATURES_POPUP,
  },

  clickPromoLink: (linkName) => ({
    ...BASIC_EVENT_PARAMETERS,
    link_name: linkName,
    place: EMPTY_STATE_WITHOUT_PLUGIN,
  }),
};
