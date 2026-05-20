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
  getBasicClickEventParameters,
  getBasicEventParameters,
  getBasicSearchEventParameters,
} from '../common/ga4Utils';

const TEST_PLANS = 'test_plans';

export const PLACE_DETAILS = 'test_plan_details';
const PLACE_ADD_TESTS_SIDEBAR = 'add_tests_sidebar';
const PLACE_KEBAB = 'test_plan_kebab_menu';
const PLACE_LIST = 'test_plans_list';
export const PLACE_TEST_CASE_LIBRARY_SIDE_PANEL = 'test_case_library_side_panel';

const CLICK = getBasicClickEventParameters(TEST_PLANS);
const SEARCH = getBasicSearchEventParameters(TEST_PLANS);

export type AddToTestLaunchPlace =
  | typeof PLACE_DETAILS
  | typeof PLACE_TEST_CASE_LIBRARY_SIDE_PANEL;

export const ACTION_SOURCE = {
  BULK: 'bulk',
  SINGLE: 'single',
} as const;
export type ActionSource = (typeof ACTION_SOURCE)[keyof typeof ACTION_SOURCE];
export type AddToTestLaunchSource = ActionSource;
export type RemoveTestFromPlanSource = ActionSource;

export const ADD_TO_LAUNCH_STATUS = {
  CREATE_NEW_LAUNCH: 'create_new_launch',
  ADD_TO_EXISTING_LAUNCH: 'add_to_existing_launch',
} as const;
export type AddToTestLaunchStatus = (typeof ADD_TO_LAUNCH_STATUS)[keyof typeof ADD_TO_LAUNCH_STATUS];

export const TEST_PLAN_DETAILS_VIEW_TYPE = {
  POPULATED: 'populated',
  EMPTY: 'empty',
} as const;
export type TestPlanDetailsViewType =
  (typeof TEST_PLAN_DETAILS_VIEW_TYPE)[keyof typeof TEST_PLAN_DETAILS_VIEW_TYPE];

export const ADD_TESTS_SIDEBAR_CONDITION = {
  ADD_TESTS_BUTTON: 'add_tests_button',
  EMPTY_PLAN_CTA: 'empty_plan_cta',
  EMPTY_FOLDER_CTA: 'empty_folder_cta',
} as const;
export type AddTestsSidebarCondition =
  (typeof ADD_TESTS_SIDEBAR_CONDITION)[keyof typeof ADD_TESTS_SIDEBAR_CONDITION];

export const DND_DROP_TARGET = {
  PLAN_LIST: 'plan_list',
  ADD_AND_CREATE_LAUNCH: 'add_and_create_launch',
} as const;
export type DndDropTarget = (typeof DND_DROP_TARGET)[keyof typeof DND_DROP_TARGET];

export const DND_ITEM_COUNT_TYPE = {
  SINGLE: 'single',
  MULTI: 'multi',
} as const;
export type DndItemCountType =
  (typeof DND_ITEM_COUNT_TYPE)[keyof typeof DND_ITEM_COUNT_TYPE];

export const TEST_PLANS_PAGE_EVENTS = {
  viewTestPlanDetailsPage: (type: TestPlanDetailsViewType) => ({
    ...getBasicEventParameters('page_view', TEST_PLANS),
    place: PLACE_DETAILS,
    type,
  }),
  CLICK_START_CREATE_LAUNCH_FROM_PLAN: {
    ...CLICK,
    place: PLACE_DETAILS,
    element_name: 'start_create_launch_from_plan',
    type: 'existing_launch',
  },
  clickStartBulkAddToLaunch: (number: number) => ({
    ...CLICK,
    place: PLACE_DETAILS,
    element_name: 'start_bulk_add_to_launch',
    number,
  }),
  clickOpenAddTestsSidebar: (condition: AddTestsSidebarCondition) => ({
    ...CLICK,
    place: PLACE_DETAILS,
    element_name: 'open_add_tests_sidebar',
    condition,
  }),
  submitAddTestsFromLibrary: (number: number) => ({
    ...CLICK,
    place: PLACE_ADD_TESTS_SIDEBAR,
    element_name: 'submit_add_tests_from_library',
    number,
  }),
  dragDropTestCaseToPlan: (params: {
    switcher: DndDropTarget;
    type: DndItemCountType;
    number: number;
  }) => ({
    ...CLICK,
    place: PLACE_ADD_TESTS_SIDEBAR,
    element_name: 'drag_drop_test_case_to_plan',
    switcher: params.switcher,
    type: params.type,
    number: params.number,
  }),
  submitRemoveTestFromPlan: (source: RemoveTestFromPlanSource) => ({
    ...CLICK,
    place: PLACE_DETAILS,
    element_name: `submit_${source}_remove_test_from_plan`,
    modal: 'remove_test_from_plan',
  }),
  CLICK_OPEN_TEST_CASE_IN_LIBRARY: {
    ...CLICK,
    place: PLACE_DETAILS,
    element_name: 'open_test_case_in_library',
  },
  clickStartAddToLaunch: (place: AddToTestLaunchPlace) => ({
    ...CLICK,
    place,
    element_name: 'start_add_to_launch',
  }),
  clickHideAddedToggle: (isOn: boolean) => ({
    ...CLICK,
    place: PLACE_TEST_CASE_LIBRARY_SIDE_PANEL,
    icon_name: isOn ? 'hide_added_on' : 'hide_added_off',
  }),
  CLICK_START_ADD_AND_CREATE_LAUNCH: {
    ...CLICK,
    place: PLACE_TEST_CASE_LIBRARY_SIDE_PANEL,
    element_name: 'start_add_and_create_launch',
  },
  submitAddToTestLaunch: (params: {
    source: AddToTestLaunchSource;
    place: AddToTestLaunchPlace;
    status: AddToTestLaunchStatus;
  }) => ({
    ...CLICK,
    place: params.place,
    element_name: `submit_${params.source}_add_to_test_launch`,
    modal: 'add_to_launch',
    status: params.status,
  }),
  SEARCH_TEST_PLANS: {
    ...SEARCH,
    place: PLACE_DETAILS,
    element_name: 'search_test_plans',
  },
  CLICK_START_EDIT_TEST_PLAN: {
    ...CLICK,
    place: PLACE_KEBAB,
    element_name: 'start_edit_test_plan',
  },
  submitEditTestPlan: (params: { number: number; condition: string }) => ({
    ...CLICK,
    place: PLACE_LIST,
    modal: 'edit_test_plan',
    element_name: 'submit_edit_test_plan',
    number: params.number,
    condition: params.condition,
  }),
  CLICK_START_DUPLICATE_TEST_PLAN: {
    ...CLICK,
    place: PLACE_KEBAB,
    element_name: 'start_duplicate_test_plan',
  },
  SUBMIT_DUPLICATE_TEST_PLAN: {
    ...CLICK,
    place: PLACE_LIST,
    modal: 'duplicate_test_plan',
    element_name: 'submit_duplicate_test_plan',
  },
  CLICK_START_DELETE_TEST_PLAN: {
    ...CLICK,
    place: PLACE_KEBAB,
    element_name: 'start_delete_test_plan',
  },
  SUBMIT_DELETE_TEST_PLAN: {
    ...CLICK,
    place: PLACE_LIST,
    modal: 'delete_test_plan',
    element_name: 'submit_delete_test_plan',
  },
};
