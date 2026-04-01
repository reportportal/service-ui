/*
 * Copyright 2019 EPAM Systems
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

import { getBasicClickEventParameters } from 'components/main/analytics/events/common/ga4Utils';
import { GA_4_FIELD_LIMIT } from 'components/main/analytics/events/common/constants';

export const PROFILE_PAGE = 'profile';
const basicClickEventParametersProfile = getBasicClickEventParameters(PROFILE_PAGE);

export const PROFILE_PAGE_EVENTS = {
  // GA4 events
  CLICK_DELETE_ACCOUNT: {
    ...basicClickEventParametersProfile,
    icon_name: 'delete_account',
  },
  CONTINUE_BTN_FEEDBACK_MODAL: {
    ...basicClickEventParametersProfile,
    element_name: 'continue',
    modal: 'delete_account',
  },
  getDeleteBtnDeleteModalEvent: (checkboxes, otherReason = '') => {
    const firstPartOfOtherReason = otherReason.slice(0, GA_4_FIELD_LIMIT);
    const secondPartOfOtherReason = otherReason.slice(GA_4_FIELD_LIMIT);

    return {
      ...basicClickEventParametersProfile,
      element_name: 'delete',
      modal: 'delete_account',
      status: checkboxes.join('#'),
      type: firstPartOfOtherReason.length ? firstPartOfOtherReason : undefined,
      condition: secondPartOfOtherReason.length ? secondPartOfOtherReason : undefined,
    };
  },
  DELETE_BTN_DELETE_MODAL_EPAM: {
    ...basicClickEventParametersProfile,
    element_name: 'delete',
    modal: 'delete_account',
  },
  CLICK_LOG_IN: {
    ...basicClickEventParametersProfile,
    element_name: 'log_in',
    place: 'page_delete_account',
  },
  CLICK_SIGN_UP: {
    ...basicClickEventParametersProfile,
    element_name: 'sign_up',
    place: 'page_delete_account',
  },
};
