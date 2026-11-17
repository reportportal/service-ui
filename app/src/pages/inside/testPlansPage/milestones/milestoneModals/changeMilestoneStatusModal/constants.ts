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

export const CHANGE_MILESTONE_STATUS_MODAL_KEY = 'changeMilestoneStatusModalKey';

export const CHANGE_MILESTONE_STATUS_ADJUST_FORM_NAME = 'change-milestone-status-adjust-form';

export const ADJUST_FORM_DOM_ID = 'change-milestone-status-adjust-form-element';

export const changeMilestoneStatusFlowType = {
  START_TESTING_SIMPLE: 'START_TESTING_SIMPLE',
  START_TESTING_DATE_CHOICE: 'START_TESTING_DATE_CHOICE',
  START_TESTING_NO_START_DATE: 'START_TESTING_NO_START_DATE',
  COMPLETE_SIMPLE: 'COMPLETE_SIMPLE',
  COMPLETE_DATE_CHOICE: 'COMPLETE_DATE_CHOICE',
  COMPLETE_NO_DEADLINE: 'COMPLETE_NO_DEADLINE',
  BACK_TO_TESTING: 'BACK_TO_TESTING',
  BACK_TO_SCHEDULED: 'BACK_TO_SCHEDULED',
} as const;
