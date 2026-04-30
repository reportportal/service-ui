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
} from '../common/ga4Utils';

const TEST_CASE_LIBRARY = 'test_case_library';

export const TEST_CASE_PLACE = {
  POPOVER: 'popover',
  SIDE_PANEL: 'side_panel',
  DETAILS_PAGE: 'details_page',
} as const;

export type TestCasePlace = (typeof TEST_CASE_PLACE)[keyof typeof TEST_CASE_PLACE];

export const PLACE_POPOVER = TEST_CASE_PLACE.POPOVER;
export const PLACE_SIDE_PANEL = TEST_CASE_PLACE.SIDE_PANEL;
export const PLACE_DETAILS_PAGE = TEST_CASE_PLACE.DETAILS_PAGE;

const TEST_CASE_MODAL = {
  CREATE_TEST_CASE: 'create_test_case',
  IMPORT_TEST_CASES: 'import_test_cases',
  DELETE_TEST_CASE: 'delete_test_case',
  DUPLICATE_TEST_CASE: 'duplicate_test_case',
  MOVE_TEST_CASE: 'move_test_case',
  FILTER_TEST_CASES: 'filter_test_cases',
  ADD_TO_TEST_PLAN: 'add_to_test_plan',
  ADD_TO_LAUNCH: 'add_to_launch',
  MOVE_TO_FOLDER: 'move_to_folder',
} as const;

const TEST_CASE_ELEMENT = {
  START_CREATE: 'start_create_test_case',
  SUBMIT_CREATE: 'submit_create_test_case',
  START_IMPORT: 'start_import_test_case',
  SUBMIT_IMPORT: 'submit_import_test_cases',
  EDIT_TEST_CASE: 'edit_test_case',
  SUBMIT_DELETE: 'submit_delete_test_case',
  SUBMIT_DUPLICATE: 'submit_duplicate_test_case',
  SUBMIT_MOVE: 'submit_move_test_case',
  SEARCH: 'search_test_cases',
  APPLY_FILTER: 'apply_filter_test_cases',
  TABLE_ROW: 'table_row_content',
  PAGE_EDIT: 'page_edit_test_case',
  SUBMIT_ADD_TO_TEST_PLAN: 'submit_add_to_test_plan',
  SUBMIT_BULK_ADD_TO_LAUNCH: 'submit_bulk_add_to_test_launch',
  SUBMIT_BULK_MOVE_TO_FOLDER: 'submit_bulk_move_to_folder',
} as const;

export const TEST_CASE_MENU_ELEMENT_NAME = {
  DUPLICATE: 'menu_duplicate',
  EDIT: 'menu_edit_test_case',
  MOVE_TO: 'menu_move_test_case_to',
  HISTORY: 'menu_history_of_actions',
  DELETE: 'menu_delete_test_case',
} as const;

export type TestCaseMenuElementName =
  (typeof TEST_CASE_MENU_ELEMENT_NAME)[keyof typeof TEST_CASE_MENU_ELEMENT_NAME];

export const TEST_CASE_BULK_OPERATION_ELEMENT_NAME = {
  DUPLICATE: 'bulk_menu_duplicate',
  EDIT_TAG: 'bulk_menu_edit_tag',
  ADD_TO_TEST_PLAN: 'bulk_menu_add_to_test_plan',
  MOVE_TO_FOLDER: 'bulk_menu_move_to_folder',
  CHANGE_PRIORITY: 'bulk_menu_change_priority',
  ADD_TO_LAUNCH: 'bulk_menu_add_to_launch',
  DELETE: 'bulk_menu_delete',
} as const;
export type TestCaseBulkOperationElementName =
  (typeof TEST_CASE_BULK_OPERATION_ELEMENT_NAME)[keyof typeof TEST_CASE_BULK_OPERATION_ELEMENT_NAME];

export const TEST_CASE_TEMPLATE_ICON = {
  STEP: 'step',
  TEXT: 'text',
} as const;
export type TestCaseTemplateIconType =
  (typeof TEST_CASE_TEMPLATE_ICON)[keyof typeof TEST_CASE_TEMPLATE_ICON];

export const TEST_CASE_TIME_CONDITION = {
  CUSTOMIZE: 'customize_time',
  NO_CUSTOMIZE: 'no_customize',
} as const;
export type TestCaseTimeConditionType =
  (typeof TEST_CASE_TIME_CONDITION)[keyof typeof TEST_CASE_TIME_CONDITION];

export const TEST_CASE_STEPS_ATTACHMENT_STATUS = {
  WITH: 'step_with_attachments',
  WITHOUT: 'step_without_attachments',
} as const;
export type TestCaseStepsAttachmentStatus =
  (typeof TEST_CASE_STEPS_ATTACHMENT_STATUS)[keyof typeof TEST_CASE_STEPS_ATTACHMENT_STATUS];

export const TEST_CASE_PRECONDITIONS_ATTACHMENT_STATUS = {
  WITH: 'precondition_with_attachments',
  WITHOUT: 'precondition_without_attachments',
} as const;
export type TestCasePreconditionsAttachmentStatus =
  (typeof TEST_CASE_PRECONDITIONS_ATTACHMENT_STATUS)[keyof typeof TEST_CASE_PRECONDITIONS_ATTACHMENT_STATUS];

export type TestCaseAttachmentStatus =
  `${TestCaseStepsAttachmentStatus}#${TestCasePreconditionsAttachmentStatus}`;

export const IMPORT_TEMPLATE_CONDITION = {
  DOWNLOAD: 'download_template',
  BROWSE: 'browse_template',
} as const;
export type ImportTemplateConditionType =
  (typeof IMPORT_TEMPLATE_CONDITION)[keyof typeof IMPORT_TEMPLATE_CONDITION];

export const IMPORT_DESTINATION = {
  NEW_FOLDER: 'new_folder',
  EXISTING_FOLDER: 'existing_folder',
} as const;
export type ImportDestinationIconType =
  (typeof IMPORT_DESTINATION)[keyof typeof IMPORT_DESTINATION];

export const MOVE_DESTINATION_STATUS = {
  EXISTING_FOLDER: 'move_to_existing_folder',
  NEW_FOLDER: 'create_new_folder',
} as const;
export type MoveDestinationStatusType =
  (typeof MOVE_DESTINATION_STATUS)[keyof typeof MOVE_DESTINATION_STATUS];

export const ADD_TO_TEST_PLAN_CONDITION = {
  SINGLE: 'single',
  BULK: 'bulk',
} as const;
export type AddToTestPlanConditionType =
  (typeof ADD_TO_TEST_PLAN_CONDITION)[keyof typeof ADD_TO_TEST_PLAN_CONDITION];

export const FILTER_FIELD = {
  PRIORITY: 'priority',
  TAG: 'tag',
  PRIORITY_AND_TAG: 'priority#tag',
} as const;
export type FilterFieldType = (typeof FILTER_FIELD)[keyof typeof FILTER_FIELD];

export const TEST_CASE_STEP_EDIT_FIELD = {
  TAGS: 'tags',
  PRECONDITION: 'precondition',
  REQUIREMENTS: 'requirements',
  EXECUTIONS_TIME: 'executions_time',
  STEPS: 'steps',
  ATTACHMENTS: 'attachments',
} as const;
export type TestCaseStepEditField =
  (typeof TEST_CASE_STEP_EDIT_FIELD)[keyof typeof TEST_CASE_STEP_EDIT_FIELD];

export const TEST_CASE_TEXT_EDIT_FIELD = {
  TAGS: 'tags',
  PRECONDITION: 'precondition',
  REQUIREMENTS: 'requirements',
  EXECUTIONS_TIME: 'executions_time',
  INSTRUCTIONS: 'instructions',
  EXPECTED_RESULTS: 'expected-results',
  ATTACHMENTS: 'attachments',
} as const;
export type TestCaseTextEditField =
  (typeof TEST_CASE_TEXT_EDIT_FIELD)[keyof typeof TEST_CASE_TEXT_EDIT_FIELD];

const CLICK = getBasicClickEventParameters(TEST_CASE_LIBRARY);
const CHOOSE = getBasicChooseEventParameters(TEST_CASE_LIBRARY);

export const TEST_CASE_LIBRARY_EVENTS = {
  CLICK_CREATE_TEST_CASE: {
    ...CLICK,
    element_name: TEST_CASE_ELEMENT.START_CREATE,
  },
  submitCreateTestCase: (params: {
    testCaseId: string;
    iconName: TestCaseTemplateIconType;
    condition: TestCaseTimeConditionType;
    number: string;
    status: TestCaseAttachmentStatus;
  }) => ({
    ...CLICK,
    modal: TEST_CASE_MODAL.CREATE_TEST_CASE,
    element_name: TEST_CASE_ELEMENT.SUBMIT_CREATE,
    test_case_id: params.testCaseId,
    icon_name: params.iconName,
    condition: params.condition,
    number: params.number,
    status: params.status,
  }),
  CLICK_IMPORT_TEST_CASES: {
    ...CLICK,
    element_name: TEST_CASE_ELEMENT.START_IMPORT,
  },
  submitImportTestCases: (
    condition: ImportTemplateConditionType,
    iconName: ImportDestinationIconType,
  ) => ({
    ...CLICK,
    modal: TEST_CASE_MODAL.IMPORT_TEST_CASES,
    element_name: TEST_CASE_ELEMENT.SUBMIT_IMPORT,
    condition,
    icon_name: iconName,
  }),
  submitEditTestCase: (params: {
    testCaseId: string;
    iconName: TestCaseTemplateIconType;
    condition: TestCaseTimeConditionType;
    number: string;
    status: TestCaseAttachmentStatus;
    editedFields: string;
    place: TestCasePlace;
  }) => ({
    ...CLICK,
    element_name: TEST_CASE_ELEMENT.EDIT_TEST_CASE,
    test_case_id: params.testCaseId,
    icon_name: params.iconName,
    condition: params.condition,
    number: params.number,
    status: params.status,
    modal: params.editedFields,
    place: params.place,
  }),
  clickTestCaseMenu: (
    elementName: TestCaseMenuElementName,
    testCaseId?: string,
  ) => ({
    ...CLICK,
    element_name: elementName,
    ...(testCaseId !== undefined && { test_case_id: testCaseId }),
  }),
  submitDeleteTestCase: (testCaseId: string) => ({
    ...CLICK,
    modal: TEST_CASE_MODAL.DELETE_TEST_CASE,
    element_name: TEST_CASE_ELEMENT.SUBMIT_DELETE,
    test_case_id: testCaseId,
  }),
  choosePopoverMenu: (
    elementName: TestCaseMenuElementName,
    testCaseId?: string,
  ) => ({
    ...CHOOSE,
    place: TEST_CASE_PLACE.POPOVER,
    element_name: elementName,
    ...(testCaseId !== undefined && { test_case_id: testCaseId }),
  }),
  submitDuplicateTestCase: (testCaseId: string) => ({
    ...CLICK,
    modal: TEST_CASE_MODAL.DUPLICATE_TEST_CASE,
    element_name: TEST_CASE_ELEMENT.SUBMIT_DUPLICATE,
    test_case_id: testCaseId,
  }),
  submitMoveTestCase: (
    status: MoveDestinationStatusType,
    testCaseId?: string,
  ) => ({
    ...CLICK,
    modal: TEST_CASE_MODAL.MOVE_TEST_CASE,
    element_name: TEST_CASE_ELEMENT.SUBMIT_MOVE,
    status,
    ...(testCaseId !== undefined && { test_case_id: testCaseId }),
  }),
  CLICK_SEARCH_TEST_CASES: {
    ...CLICK,
    element_name: TEST_CASE_ELEMENT.SEARCH,
  },
  applyFilterTestCases: (type: FilterFieldType) => ({
    ...CLICK,
    modal: TEST_CASE_MODAL.FILTER_TEST_CASES,
    element_name: TEST_CASE_ELEMENT.APPLY_FILTER,
    type,
  }),
  clickTestCaseRow: (testCaseId: string) => ({
    ...CLICK,
    element_name: TEST_CASE_ELEMENT.TABLE_ROW,
    test_case_id: testCaseId,
  }),
  clickSidePanelMenu: (elementName: TestCaseMenuElementName) => ({
    ...CLICK,
    place: TEST_CASE_PLACE.SIDE_PANEL,
    element_name: elementName,
  }),
  clickEditTestCaseFromDetails: (testCaseId?: string) => ({
    ...CLICK,
    place: TEST_CASE_PLACE.DETAILS_PAGE,
    element_name: TEST_CASE_ELEMENT.PAGE_EDIT,
    ...(testCaseId !== undefined && { test_case_id: testCaseId }),
  }),
  submitAddToTestPlan: (condition: AddToTestPlanConditionType) => ({
    ...CLICK,
    modal: TEST_CASE_MODAL.ADD_TO_TEST_PLAN,
    element_name: TEST_CASE_ELEMENT.SUBMIT_ADD_TO_TEST_PLAN,
    condition,
  }),
  SUBMIT_BULK_ADD_TO_LAUNCH: {
    ...CLICK,
    modal: TEST_CASE_MODAL.ADD_TO_LAUNCH,
    element_name: TEST_CASE_ELEMENT.SUBMIT_BULK_ADD_TO_LAUNCH,
  },
  clickBulkOperation: (elementName: TestCaseBulkOperationElementName) => ({
    ...CLICK,
    element_name: elementName,
  }),
  submitBulkMoveToFolder: (status: MoveDestinationStatusType) => ({
    ...CLICK,
    modal: TEST_CASE_MODAL.MOVE_TO_FOLDER,
    element_name: TEST_CASE_ELEMENT.SUBMIT_BULK_MOVE_TO_FOLDER,
    status,
  }),
};
