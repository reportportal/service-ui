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
  getDeleteBtnDeleteModalEvent: (checkboxes, otherReason) => ({
    ...basicClickEventParametersProfile,
    element_name: 'delete',
    modal: 'delete_account',
    status: checkboxes.join('#'),
    type: otherReason.slice(0, GA_4_FIELD_LIMIT),
    condition: otherReason.slice(GA_4_FIELD_LIMIT),
  }),
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
  // GA3 events
  CHANGE_PASSWORD_CLICK: {
    category: PROFILE_PAGE,
    action: 'Click on Btn Change password',
    label: 'Arise Modal Change password',
  },
  EDIT_USER_NAME_ICON: {
    category: PROFILE_PAGE,
    action: 'Click on icon Edit User name',
    label: 'Arise Modal Edit Personal Information',
  },
  EDIT_EMAIL_ICON: {
    category: PROFILE_PAGE,
    action: 'Click on icon Edit Email',
    label: 'Arise Modal Edit Personal Information',
  },
  UPLOAD_PHOTO_BTN: {
    category: PROFILE_PAGE,
    action: 'Click on Btn Upload photo',
    label: 'Upload photo',
  },
  REMOVE_PHOTO_BTN: {
    category: PROFILE_PAGE,
    action: 'Click on link Remove photo',
    label: 'Arise Modal Delete image',
  },
  REGENERATE_BTN: {
    category: PROFILE_PAGE,
    action: 'Click on Btn Regenerate',
    label: 'Regenerate',
  },
  SELECT_CONFIGURATION_TAB: {
    category: PROFILE_PAGE,
    action: 'Select configuration tab',
    label: 'Select configuration tab',
  },
  CLOSE_ICON_CHANGE_PASSWORD_MODAL: {
    category: PROFILE_PAGE,
    action: 'Click on icon Close on Modal Change password',
    label: 'Close Modal Change password',
  },
  CANCEL_BTN_CHANGE_PASSWORD_MODAL: {
    category: PROFILE_PAGE,
    action: 'Click on Btn Cancel on Modal Change password',
    label: 'Close Modal Change password',
  },
  SUBMIT_BTN_CHANGE_PASSWORD_MODAL: {
    category: PROFILE_PAGE,
    action: 'Click on Btn Submit on Modal Change password',
    label: 'Submit changes on Modal Change password',
  },
  CLOSE_ICON_DELETE_IMAGE_MODAL: {
    category: PROFILE_PAGE,
    action: 'Click on icon Close on Modal Delete image',
    label: 'Close Modal Delete image',
  },
  CANCEL_BTN_DELETE_IMAGE_MODAL: {
    category: PROFILE_PAGE,
    action: 'Click on Btn Cancel on Modal Delete image',
    label: 'Close Modal Delete image',
  },
  DELETE_BTN_DELETE_IMAGE_MODAL: {
    category: PROFILE_PAGE,
    action: 'Click on Btn Delete on Modal Delete image',
    label: 'Delete image',
  },
  CLOSE_ICON_EDIT_PERSONAL_INFO_MODAL: {
    category: PROFILE_PAGE,
    action: 'Click on icon Close on Modal Edit personal information',
    label: 'Close Modal Edit personal information',
  },
  EDIT_USER_NAME_EDIT_PERSONAL_INFO_MODAL: {
    category: PROFILE_PAGE,
    action: 'Edit input User name on Modal Edit personal information',
    label: 'Edit User name on Modal Edit personal information',
  },
  EDIT_EMAIL_EDIT_PERSONAL_INFO_MODAL: {
    category: PROFILE_PAGE,
    action: 'Edit input Email on Modal Edit personal information',
    label: 'Edit Email on Modal Edit personal information',
  },
  CANCEL_BTN_EDIT_PERSONAL_INFO_MODAL: {
    category: PROFILE_PAGE,
    action: 'Click on Btn Cancel on Modal Edit personal information',
    label: 'Close Modal Edit personal information',
  },
  SUBMIT_BTN_EDIT_PERSONAL_INFO_MODAL: {
    category: PROFILE_PAGE,
    action: 'Click on Btn Submit on Modal Edit personal information',
    label: 'Submit changes on Modal Edit personal information',
  },
  CHANGE_LANGUAGE: {
    category: PROFILE_PAGE,
    action: 'Edit input Language',
    label: 'Change language',
  },
};
