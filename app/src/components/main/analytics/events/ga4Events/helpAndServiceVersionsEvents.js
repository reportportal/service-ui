/*
 * Copyright 2024 EPAM Systems
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

import {
  getBasicClickEventParameters,
  normalizeEventParameter,
} from 'components/main/analytics/events/common/ga4Utils';

const HELP_AND_SERVICE_VERSIONS = 'help_and_service_versions';

export const HELP_AND_SERVICE_VERSIONS_EVENTS = {
  onClickPopoverItem: (linkName) => ({
    ...getBasicClickEventParameters(HELP_AND_SERVICE_VERSIONS),
    place: 'popover',
    link_name: normalizeEventParameter(linkName),
  }),
  onClickFAQItem: (linkName) => ({
    ...getBasicClickEventParameters(HELP_AND_SERVICE_VERSIONS),
    place: 'faq',
    link_name: linkName,
  }),
  CLICK_REQUEST_PROFESSIONAL_SERVICE: {
    ...getBasicClickEventParameters(HELP_AND_SERVICE_VERSIONS),
    place: 'faq',
    element_name: 'request_professional_service',
  },
  CLICK_SEND_REQUEST_SERVICE_BUTTON: {
    ...getBasicClickEventParameters(HELP_AND_SERVICE_VERSIONS),
    modal: 'request_professional_service',
    element_name: 'send_request',
  },
};
