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
  normalizeEventParameter,
} from '../common/ga4Utils';

const MANUAL_LAUNCHES = 'manual_launches';

export const MANUAL_LAUNCHES_PLACE = {
  MANUAL_LAUNCHES_LIST: 'manual_launches_list',
  MANUAL_LAUNCHES_FILTER_PANEL: 'manual_launches_filter_panel',
  LAUNCH_DETAILS_SIDEBAR: 'launch_details_sidebar',
  EDIT_LAUNCH_MODAL: 'edit_launch_modal',
  DELETE_LAUNCH_MODAL: 'delete_launch_modal',
  ALL_TEST_EXECUTIONS: 'all_test_executions',
  EXECUTION_FILTER_PANEL: 'execution_filter_panel',
  EXECUTION_DETAILS_SIDEBAR: 'execution_details_sidebar',
  DELETE_TEST_EXECUTION_MODAL: 'delete_test_execution_modal',
  TEST_EXECUTION_PAGE: 'test_execution_page',
  TEST_EXECUTION_PAGE_HEADER: 'test_execution_page_header',
  TEST_EXECUTION_PAGE_BTS_SECTION: 'test_execution_page_bts_section',
  EXECUTION_DETAILS_SIDEBAR_FAILED: 'execution_details_sidebar_failed',
  CLEAR_STATUS_MODAL: 'clear_status_modal',
} as const;

export type ManualLaunchListOrSidebarPlace =
  | typeof MANUAL_LAUNCHES_PLACE.MANUAL_LAUNCHES_LIST
  | typeof MANUAL_LAUNCHES_PLACE.LAUNCH_DETAILS_SIDEBAR;

export type ExecutionStatusChangePlace =
  | typeof MANUAL_LAUNCHES_PLACE.EXECUTION_DETAILS_SIDEBAR
  | typeof MANUAL_LAUNCHES_PLACE.TEST_EXECUTION_PAGE;

export type BtsModalEntryPlace =
  | typeof MANUAL_LAUNCHES_PLACE.TEST_EXECUTION_PAGE_HEADER
  | typeof MANUAL_LAUNCHES_PLACE.TEST_EXECUTION_PAGE_BTS_SECTION
  | typeof MANUAL_LAUNCHES_PLACE.EXECUTION_DETAILS_SIDEBAR_FAILED;

export const getBtsModalEntryPlaceFromStatusChangePlace = (
  place: ExecutionStatusChangePlace,
): BtsModalEntryPlace =>
  place === MANUAL_LAUNCHES_PLACE.EXECUTION_DETAILS_SIDEBAR
    ? MANUAL_LAUNCHES_PLACE.EXECUTION_DETAILS_SIDEBAR_FAILED
    : MANUAL_LAUNCHES_PLACE.TEST_EXECUTION_PAGE_HEADER;

const MANUAL_LAUNCHES_MODAL = {
  EDIT_LAUNCH: 'edit_launch',
  DELETE_LAUNCH: 'delete_launch',
  DELETE_TEST_EXECUTION: 'delete_test_execution',
  CLEAR_STATUS: 'clear_status',
  ADD_TO_TEST_PLAN: 'add_to_test_plan',
  POST_LINK_BTS: 'post_link_bts',
} as const;

const MANUAL_LAUNCHES_ELEMENT = {
  GO_TO_TEST_PLANS: 'go_to_test_plans',
  OPEN_TEST_LIBRARY: 'open_test_library',
  OPEN_LAUNCH_SIDEBAR: 'open_launch_sidebar',
  OPEN_LAUNCH_DETAILS: 'open_launch_details',
  APPLY_FILTER: 'apply_filter',
  SHOW_TO_RUN: 'show_to_run',
  START_EDIT_LAUNCH: 'start_edit_launch',
  SUBMIT_EDIT_LAUNCH: 'submit_edit_launch',
  START_DELETE_LAUNCH: 'start_delete_launch',
  CONFIRM_DELETE_LAUNCH: 'confirm_delete_launch',
  CONFIRM_BULK_DELETE_LAUNCHES: 'confirm_bulk_delete_launches',
  OPEN_EXECUTION_SIDEBAR: 'open_execution_sidebar',
  RUN_TEST: 'run_test',
  CHANGE_STATUS: 'change_status',
  CLEAR_TEST_STATUS: 'clear_test_status',
  SUBMIT_DELETE_TEST_EXECUTION: 'submit_delete_test_execution',
  SUBMIT_BULK_DELETE_TEST_EXECUTION: 'submit_bulk_delete_test_execution',
  SUBMIT_ADD_TO_TEST_PLAN: 'submit_add_to_test_plan',
  SUBMIT_BTS_ACTION: 'submit_bts_action',
  ISSUE_TICKET: 'issue_ticket',
  SAVE_ATTACHMENTS: 'save_attachments',
  SAVE_EXECUTION_COMMENT: 'save_execution_comment',
  START_DELETE_TEST_EXECUTION: 'start_delete_test_execution',
  START_BULK_DELETE_TEST_EXECUTION: 'start_bulk_delete_test_execution',
  CONTINUE_TESTING: 'continue_testing',
  SEARCH_MANUAL_LAUNCHES: 'search_manual_launches',
} as const;

export const TEST_EXECUTION_TEMPLATE_TYPE = {
  STEPS: 'steps',
  TEXT: 'text',
} as const;
export type TestExecutionTemplateType =
  (typeof TEST_EXECUTION_TEMPLATE_TYPE)[keyof typeof TEST_EXECUTION_TEMPLATE_TYPE];

export const EXECUTION_STATUS_TYPE = {
  PASSED: 'passed',
  FAILED: 'failed',
  SKIPPED: 'skipped',
} as const;
export type ExecutionStatusType =
  (typeof EXECUTION_STATUS_TYPE)[keyof typeof EXECUTION_STATUS_TYPE];

export const BTS_ACTION_TYPE = {
  LINK: 'link',
  POST: 'post',
} as const;
export type BtsActionType = (typeof BTS_ACTION_TYPE)[keyof typeof BTS_ACTION_TYPE];

const PAGE_VIEW = getBasicEventParameters('page_view', MANUAL_LAUNCHES);
const CLICK = getBasicClickEventParameters(MANUAL_LAUNCHES);
const CHOOSE = getBasicChooseEventParameters(MANUAL_LAUNCHES);

export const MANUAL_LAUNCHES_PAGE_EVENTS = {
  VIEW_MANUAL_LAUNCHES_PAGE: {
    ...PAGE_VIEW,
    place: MANUAL_LAUNCHES_PLACE.MANUAL_LAUNCHES_LIST,
  },
  CLICK_GO_TO_TEST_PLANS: {
    ...CLICK,
    place: MANUAL_LAUNCHES_PLACE.MANUAL_LAUNCHES_LIST,
    element_name: MANUAL_LAUNCHES_ELEMENT.GO_TO_TEST_PLANS,
  },
  CLICK_OPEN_TEST_LIBRARY: {
    ...CLICK,
    place: MANUAL_LAUNCHES_PLACE.MANUAL_LAUNCHES_LIST,
    element_name: MANUAL_LAUNCHES_ELEMENT.OPEN_TEST_LIBRARY,
  },
  CLICK_OPEN_LAUNCH_SIDEBAR: {
    ...CLICK,
    place: MANUAL_LAUNCHES_PLACE.MANUAL_LAUNCHES_LIST,
    element_name: MANUAL_LAUNCHES_ELEMENT.OPEN_LAUNCH_SIDEBAR,
  },
  CLICK_OPEN_LAUNCH_DETAILS: {
    ...CLICK,
    place: MANUAL_LAUNCHES_PLACE.MANUAL_LAUNCHES_LIST,
    element_name: MANUAL_LAUNCHES_ELEMENT.OPEN_LAUNCH_DETAILS,
  },
  VIEW_ALL_TEST_EXECUTIONS_PAGE: {
    ...PAGE_VIEW,
    place: MANUAL_LAUNCHES_PLACE.ALL_TEST_EXECUTIONS,
  },
  CLICK_APPLY_LAUNCHES_FILTER: {
    ...CLICK,
    place: MANUAL_LAUNCHES_PLACE.MANUAL_LAUNCHES_FILTER_PANEL,
    element_name: MANUAL_LAUNCHES_ELEMENT.APPLY_FILTER,
  },
  clickShowToRun: (place: ManualLaunchListOrSidebarPlace) => ({
    ...CLICK,
    place,
    element_name: MANUAL_LAUNCHES_ELEMENT.SHOW_TO_RUN,
  }),
  CLICK_START_EDIT_LAUNCH: {
    ...CLICK,
    place: MANUAL_LAUNCHES_PLACE.LAUNCH_DETAILS_SIDEBAR,
    element_name: MANUAL_LAUNCHES_ELEMENT.START_EDIT_LAUNCH,
  },
  SUBMIT_EDIT_LAUNCH: {
    ...CLICK,
    place: MANUAL_LAUNCHES_PLACE.EDIT_LAUNCH_MODAL,
    modal: MANUAL_LAUNCHES_MODAL.EDIT_LAUNCH,
    element_name: MANUAL_LAUNCHES_ELEMENT.SUBMIT_EDIT_LAUNCH,
  },
  clickStartDeleteLaunch: (place: ManualLaunchListOrSidebarPlace) => ({
    ...CLICK,
    place,
    element_name: MANUAL_LAUNCHES_ELEMENT.START_DELETE_LAUNCH,
  }),
  CONFIRM_DELETE_LAUNCH: {
    ...CLICK,
    place: MANUAL_LAUNCHES_PLACE.DELETE_LAUNCH_MODAL,
    modal: MANUAL_LAUNCHES_MODAL.DELETE_LAUNCH,
    element_name: MANUAL_LAUNCHES_ELEMENT.CONFIRM_DELETE_LAUNCH,
  },
  confirmBulkDeleteLaunches: (number: number) => ({
    ...CLICK,
    place: MANUAL_LAUNCHES_PLACE.DELETE_LAUNCH_MODAL,
    modal: MANUAL_LAUNCHES_MODAL.DELETE_LAUNCH,
    element_name: MANUAL_LAUNCHES_ELEMENT.CONFIRM_BULK_DELETE_LAUNCHES,
    number,
  }),
  CLICK_APPLY_EXECUTIONS_FILTER: {
    ...CLICK,
    place: MANUAL_LAUNCHES_PLACE.EXECUTION_FILTER_PANEL,
    element_name: MANUAL_LAUNCHES_ELEMENT.APPLY_FILTER,
  },
  CLICK_OPEN_EXECUTION_SIDEBAR: {
    ...CLICK,
    place: MANUAL_LAUNCHES_PLACE.ALL_TEST_EXECUTIONS,
    element_name: MANUAL_LAUNCHES_ELEMENT.OPEN_EXECUTION_SIDEBAR,
  },
  CLICK_RUN_TEST: {
    ...CLICK,
    place: MANUAL_LAUNCHES_PLACE.EXECUTION_DETAILS_SIDEBAR,
    element_name: MANUAL_LAUNCHES_ELEMENT.RUN_TEST,
  },
  viewTestExecutionPage: (type: TestExecutionTemplateType) => ({
    ...PAGE_VIEW,
    place: MANUAL_LAUNCHES_PLACE.TEST_EXECUTION_PAGE,
    type,
  }),
  chooseExecutionStatus: (
    place: ExecutionStatusChangePlace,
    type: ExecutionStatusType,
  ) => ({
    ...CHOOSE,
    place,
    element_name: MANUAL_LAUNCHES_ELEMENT.CHANGE_STATUS,
    type,
  }),
  CLICK_CLEAR_TEST_STATUS: {
    ...CLICK,
    place: MANUAL_LAUNCHES_PLACE.CLEAR_STATUS_MODAL,
    modal: MANUAL_LAUNCHES_MODAL.CLEAR_STATUS,
    element_name: MANUAL_LAUNCHES_ELEMENT.CLEAR_TEST_STATUS,
  },
  SUBMIT_DELETE_TEST_EXECUTION: {
    ...CLICK,
    place: MANUAL_LAUNCHES_PLACE.DELETE_TEST_EXECUTION_MODAL,
    modal: MANUAL_LAUNCHES_MODAL.DELETE_TEST_EXECUTION,
    element_name: MANUAL_LAUNCHES_ELEMENT.SUBMIT_DELETE_TEST_EXECUTION,
  },
  submitBulkDeleteTestExecution: (number: number) => ({
    ...CLICK,
    place: MANUAL_LAUNCHES_PLACE.DELETE_TEST_EXECUTION_MODAL,
    modal: MANUAL_LAUNCHES_MODAL.DELETE_TEST_EXECUTION,
    element_name: MANUAL_LAUNCHES_ELEMENT.SUBMIT_BULK_DELETE_TEST_EXECUTION,
    number,
  }),
  SUBMIT_ADD_TO_TEST_PLAN: {
    ...CLICK,
    place: MANUAL_LAUNCHES_PLACE.TEST_EXECUTION_PAGE,
    modal: MANUAL_LAUNCHES_MODAL.ADD_TO_TEST_PLAN,
    element_name: MANUAL_LAUNCHES_ELEMENT.SUBMIT_ADD_TO_TEST_PLAN,
  },
  submitBtsAction: (place: BtsModalEntryPlace, type: BtsActionType) => ({
    ...CLICK,
    place,
    modal: MANUAL_LAUNCHES_MODAL.POST_LINK_BTS,
    element_name: MANUAL_LAUNCHES_ELEMENT.SUBMIT_BTS_ACTION,
    type,
  }),
  clickIssueTicket: (pluginName: string) => ({
    ...CLICK,
    place: MANUAL_LAUNCHES_PLACE.TEST_EXECUTION_PAGE,
    element_name: MANUAL_LAUNCHES_ELEMENT.ISSUE_TICKET,
    type: normalizeEventParameter(pluginName || 'BTS'),
  }),
  CLICK_SAVE_ATTACHMENTS: {
    ...CLICK,
    place: MANUAL_LAUNCHES_PLACE.TEST_EXECUTION_PAGE,
    element_name: MANUAL_LAUNCHES_ELEMENT.SAVE_ATTACHMENTS,
  },
  CLICK_SAVE_EXECUTION_COMMENT: {
    ...CLICK,
    place: MANUAL_LAUNCHES_PLACE.TEST_EXECUTION_PAGE,
    element_name: MANUAL_LAUNCHES_ELEMENT.SAVE_EXECUTION_COMMENT,
  },
  CLICK_START_DELETE_TEST_EXECUTION: {
    ...CLICK,
    place: MANUAL_LAUNCHES_PLACE.EXECUTION_DETAILS_SIDEBAR,
    element_name: MANUAL_LAUNCHES_ELEMENT.START_DELETE_TEST_EXECUTION,
  },
  CLICK_START_BULK_DELETE_TEST_EXECUTION: {
    ...CLICK,
    place: MANUAL_LAUNCHES_PLACE.ALL_TEST_EXECUTIONS,
    element_name: MANUAL_LAUNCHES_ELEMENT.START_BULK_DELETE_TEST_EXECUTION,
  },
  CLICK_CONTINUE_TESTING: {
    ...CLICK,
    place: MANUAL_LAUNCHES_PLACE.EXECUTION_DETAILS_SIDEBAR,
    element_name: MANUAL_LAUNCHES_ELEMENT.CONTINUE_TESTING,
  },
  CLICK_SEARCH_MANUAL_LAUNCHES: {
    ...CLICK,
    element_name: MANUAL_LAUNCHES_ELEMENT.SEARCH_MANUAL_LAUNCHES,
  },
};
