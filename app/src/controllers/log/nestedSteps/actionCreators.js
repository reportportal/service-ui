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

import {
  REQUEST_NESTED_STEP,
  FETCH_NESTED_STEP_START,
  FETCH_NESTED_STEP_SUCCESS,
  FETCH_NESTED_STEP_ERROR,
  TOGGLE_NESTED_STEP,
  LOAD_MORE_NESTED_STEP,
} from './constants';

export const requestNestedStepAction = (payload) => ({
  type: REQUEST_NESTED_STEP,
  payload,
});
export const fetchNestedStepStartAction = (payload) => ({
  type: FETCH_NESTED_STEP_START,
  payload,
});
export const fetchNestedStepSuccessAction = (payload) => ({
  type: FETCH_NESTED_STEP_SUCCESS,
  payload,
});
export const fetchNestedStepErrorAction = (payload) => ({
  type: FETCH_NESTED_STEP_ERROR,
  payload,
});

export const toggleNestedStepAction = (payload) => ({
  type: TOGGLE_NESTED_STEP,
  payload,
});
export const loadMoreNestedStepAction = (payload) => ({
  type: LOAD_MORE_NESTED_STEP,
  payload,
});
