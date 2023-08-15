/*
 * Copyright 2023 EPAM Systems
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

import { ADMINISTRATE } from './adminProjectsPageEvents';
import { getBasicClickEventParameters, normalizeEventParameter } from './common/ga4Utils';

const basicEventMonitoringClickEventParams = getBasicClickEventParameters(ADMINISTRATE);

export const ADMIN_EVENT_MONITORING_PAGE_EVENTS = {
  TOGGLE_POPUP: {
    ...basicEventMonitoringClickEventParams,
    place: 'search_field',
    icon_name: 'filter',
  },
  CLICK_APPLY_BUTTON: (type) => ({
    ...basicEventMonitoringClickEventParams,
    modal: 'filter_monitoring',
    element_name: 'apply',
    type: normalizeEventParameter(type),
  }),
};
