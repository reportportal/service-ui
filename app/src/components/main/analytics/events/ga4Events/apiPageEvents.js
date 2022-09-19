/*
 * Copyright 2022 EPAM Systems
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

import { normalizeEventString } from '../../utils';

const API = 'api_documentation';

const BASIC_EVENT_PARAMETERS_API_PAGE = {
  action: 'click',
  category: API,
};

export const SIDEBAR_API_EVENTS = {
  CLICK_SHOW_HIDE_BLOCK: (name, place) => ({
    ...BASIC_EVENT_PARAMETERS_API_PAGE,
    place: normalizeEventString(place),
    element_name: 'button_show',
    type: normalizeEventString(name),
  }),
};
