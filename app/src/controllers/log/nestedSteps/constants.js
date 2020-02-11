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

export const CLEAR_NESTED_STEP = 'clearNestedStep';
export const TOGGLE_NESTED_STEP = 'toggleNestedStep';
export const CLEAR_NESTED_STEPS = 'clearNestedSteps';

export const REQUEST_NESTED_STEP = 'requestNestedStepAction';
export const LOAD_MORE_NESTED_STEP = 'loadMoreNestedStepAction';
export const FETCH_NESTED_STEP_START = 'fetchNestedStepStartAction';
export const FETCH_NESTED_STEP_SUCCESS = 'fetchNestedStepSuccessAction';
export const FETCH_NESTED_STEP_ERROR = 'fetchNestedStepErrorAction';

export const PAGINATION_OFFSET = 10;

export const INITIAL_STATE = {
  loading: false,
  content: [],
  page: {},
  collapsed: true,
  initial: true,
};
