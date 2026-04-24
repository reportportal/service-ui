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

import {
  getBasicChooseEventParameters,
  getBasicClickEventParameters,
  getBasicEventParameters,
} from '../common/ga4Utils';

const MILESTONES = 'milestones';
const PLACE_PAGE = 'milestones_page';
const PLACE_KEBAB = 'milestone_kebab_menu';
const PLACE_EMPTY = 'expanded_milestone_empty_state';

export const PLACE_TP_ROW = 'expanded_milestone_test_plan';

const CLICK = getBasicClickEventParameters(MILESTONES);

export type MilestoneStatusType = 'scheduled' | 'testing' | 'completed';

export const MILESTONES_PAGE_EVENTS = {
  VIEW_MILESTONES_PAGE: {
    ...getBasicEventParameters('page_view', MILESTONES),
    place: PLACE_PAGE,
  },
  CLICK_CREATE_MILESTONE: {
    ...CLICK,
    place: PLACE_PAGE,
    element_name: 'start_create_milestone',
  },
  SUBMIT_CREATE_MILESTONE: {
    ...CLICK,
    place: PLACE_PAGE,
    modal: 'create_milestone',
    element_name: 'submit_create_milestone',
  },
  CLICK_EDIT_MILESTONE: {
    ...CLICK,
    place: PLACE_KEBAB,
    element_name: 'start_edit_milestone',
  },
  SUBMIT_EDIT_MILESTONE: {
    ...CLICK,
    place: PLACE_PAGE,
    modal: 'edit_milestone',
    element_name: 'submit_edit_milestone',
  },
  CLICK_DUPLICATE_MILESTONE: {
    ...CLICK,
    place: PLACE_KEBAB,
    element_name: 'start_duplicate_milestone',
  },
  SUBMIT_DUPLICATE_MILESTONE: {
    ...CLICK,
    place: PLACE_PAGE,
    modal: 'duplicate_milestone',
    element_name: 'submit_duplicate_milestone',
  },
  CLICK_DELETE_MILESTONE: {
    ...CLICK,
    place: PLACE_KEBAB,
    element_name: 'start_delete_milestone',
  },
  SUBMIT_DELETE_MILESTONE: {
    ...CLICK,
    place: PLACE_PAGE,
    modal: 'delete_milestone',
    element_name: 'submit_delete_milestone',
  },
  chooseMilestoneStatus: (type: MilestoneStatusType) => ({
    ...getBasicChooseEventParameters(MILESTONES),
    place: PLACE_PAGE,
    element_name: 'milestone_status',
    type,
  }),
  confirmStatusWithoutReplacing: (status: MilestoneStatusType) => ({
    ...CLICK,
    place: PLACE_PAGE,
    modal: 'change_status',
    element_name: 'start_without_replacing',
    status,
  }),
  confirmStatusCompleteWithToday: (status: MilestoneStatusType) => ({
    ...CLICK,
    place: PLACE_PAGE,
    modal: 'change_status',
    element_name: 'complete_with_today',
    status,
  }),
  confirmStatusWithToday: (status: MilestoneStatusType) => ({
    ...CLICK,
    place: PLACE_PAGE,
    modal: 'change_status',
    element_name: 'start_with_today',
    status,
  }),
  confirmStatusChange: (status: MilestoneStatusType) => ({
    ...CLICK,
    place: PLACE_PAGE,
    modal: 'change_status',
    element_name: 'change',
    status,
  }),
  CLICK_CREATE_TEST_PLAN_KEBAB: {
    ...CLICK,
    place: PLACE_KEBAB,
    element_name: 'start_create_test_plan',
  },
  CLICK_CREATE_TEST_PLAN_EMPTY: {
    ...CLICK,
    place: PLACE_EMPTY,
    element_name: 'start_create_test_plan',
  },
  submitCreateTestPlan: (attributesCount: number) => ({
    ...CLICK,
    place: PLACE_PAGE,
    modal: 'create_test_plan',
    element_name: 'submit_create_test_plan',
    number: attributesCount,
  }),
  CLICK_EDIT_TEST_PLAN: {
    ...CLICK,
    place: PLACE_TP_ROW,
    element_name: 'start_edit_test_plan',
  },
  submitEditTestPlan: (attributesCount: number) => ({
    ...CLICK,
    place: PLACE_PAGE,
    modal: 'edit_test_plan',
    element_name: 'submit_edit_test_plan',
    number: attributesCount,
  }),
  CLICK_DUPLICATE_TEST_PLAN: {
    ...CLICK,
    place: PLACE_TP_ROW,
    element_name: 'duplicate_test_plan',
  },
  submitDuplicateTestPlan: (attributesCount: number) => ({
    ...CLICK,
    place: PLACE_TP_ROW,
    modal: 'duplicate_test_plan',
    element_name: 'submit_duplicate_test_plan',
    number: attributesCount,
  }),
  CLICK_DELETE_TEST_PLAN: {
    ...CLICK,
    place: PLACE_TP_ROW,
    element_name: 'start_delete_test_plan',
  },
  SUBMIT_DELETE_TEST_PLAN: {
    ...CLICK,
    place: PLACE_PAGE,
    modal: 'delete_test_plan',
    element_name: 'submit_delete_test_plan',
  },
  CLICK_OPEN_ALL_TEST_CASES: {
    ...CLICK,
    place: PLACE_TP_ROW,
    element_name: 'open_all_test_cases',
  },
  CLICK_OPEN_TEST_PLAN_DETAILS: {
    ...CLICK,
    place: PLACE_TP_ROW,
    element_name: 'open_test_plan_details_page',
  },
  CLICK_MILESTONE_ROW_EXPAND: {
    ...CLICK,
    place: PLACE_PAGE,
    element_name: 'milestone_row_expand',
  },
};
