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

import { getBasicClickEventParameters } from '../common/ga4Utils';

const PROFILE_PAGE = 'profile';

const BASIC_EVENT_PARAMETERS_PROFILE = getBasicClickEventParameters(PROFILE_PAGE);

export const PROFILE_EVENTS = {
  CHANGE_LANGUAGE: (lang) => ({
    ...BASIC_EVENT_PARAMETERS_PROFILE,
    place: PROFILE_PAGE,
    type: lang,
    element_name: 'language_drop_down',
  }),

  CLICK_API_KEYS_TAB_EVENT: {
    ...BASIC_EVENT_PARAMETERS_PROFILE,
    element_name: 'tab_api_keys',
  },

  CLICK_GENERATE_BUTTON_WITH_API_KEY: {
    ...BASIC_EVENT_PARAMETERS_PROFILE,
    element_name: 'generate_api_key',
    type: 'with_api_key',
  },

  CLICK_GENERATE_BUTTON_NO_API_KEY: {
    ...BASIC_EVENT_PARAMETERS_PROFILE,
    element_name: 'generate_api_key',
    type: 'no_api_key',
  },

  CLICK_GENERATE_API_KEY_BUTTON_IN_MODAL: {
    ...BASIC_EVENT_PARAMETERS_PROFILE,
    element_name: 'generate',
    modal: 'generate_api_key',
  },

  CLICK_COPY_TO_CLIPBOARD_BUTTON: {
    ...BASIC_EVENT_PARAMETERS_PROFILE,
    element_name: 'copy',
    modal: 'api_key_generated',
  },

  CLICK_DOCUMENTATION_LINK_WITH_API_KEY: {
    ...BASIC_EVENT_PARAMETERS_PROFILE,
    link_name: 'documentation',
    place: 'with_api_key',
  },

  CLICK_DOCUMENTATION_LINK_NO_API_KEY: {
    ...BASIC_EVENT_PARAMETERS_PROFILE,
    link_name: 'documentation',
    place: 'no_api_key',
  },

  CLICK_REVOKE_BUTTON: {
    ...BASIC_EVENT_PARAMETERS_PROFILE,
    element_name: 'revoke',
  },

  CLICK_REVOKE_BUTTON_IN_MODAL: {
    ...BASIC_EVENT_PARAMETERS_PROFILE,
    element_name: 'revoke',
    modal: 'revoke_api_key',
  },
};
