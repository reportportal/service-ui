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

import { getBasicClickEventParameters, getBasicChooseEventParameters } from '../common/ga4Utils';

const HELP_AND_SUPPORT = 'help_and_support';

export const HELP_AND_SUPPORT_EVENTS = {
  CLICK_HELP_AND_SUPPORT_BUTTON: {
    ...getBasicClickEventParameters(HELP_AND_SUPPORT),
    place: 'sidebar',
    element_name: 'help_and_support',
  },

  CLICK_REQUEST_SUPPORT_BUTTON: {
    ...getBasicClickEventParameters(HELP_AND_SUPPORT),
    modal: 'help_and_support',
    element_name: 'request_support',
  },

  CLICK_ON_SUPPORT_LINK: (linkName) => ({
    ...getBasicClickEventParameters(HELP_AND_SUPPORT),
    modal: 'help_and_support',
    link_name: linkName,
  }),

  CLICK_SEND_REQUEST_SUPPORT_BUTTON: {
    ...getBasicClickEventParameters(HELP_AND_SUPPORT),
    modal: 'request_support',
    element_name: 'send',
  },

  CHOOSE_INSTRUCTION_BUTTON: (typeName) => ({
    ...getBasicChooseEventParameters(HELP_AND_SUPPORT),
    modal: 'help_and_support',
    element_name: 'instruction',
    type: typeName,
  }),

  CLICK_ASK_A_QUESTION_BUTTON: {
    ...getBasicClickEventParameters(HELP_AND_SUPPORT),
    modal: 'help_and_support',
    element_name: 'ask_a_question',
  },
};
