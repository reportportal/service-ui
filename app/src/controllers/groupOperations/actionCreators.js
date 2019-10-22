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
  SELECT_ITEMS,
  TOGGLE_ITEM_SELECTION,
  UNSELECT_ALL_ITEMS,
  REMOVE_VALIDATION_ERRORS,
  SET_LAST_OPERATION,
  SET_VALIDATION_ERRORS,
  PROCEED_WITH_VALID_ITEMS,
  UNSELECT_ITEMS,
  TOGGLE_ALL_ITEMS,
} from './constants';

export const setValidationErrorsAction = (namespace) => (errors) => ({
  type: SET_VALIDATION_ERRORS,
  payload: errors,
  meta: {
    namespace,
  },
});
export const resetValidationErrorsAction = (namespace) => () => ({
  type: SET_VALIDATION_ERRORS,
  payload: {},
  meta: {
    namespace,
  },
});
export const removeValidationErrorsAction = (namespace) => (ids) => ({
  type: REMOVE_VALIDATION_ERRORS,
  payload: ids,
  meta: {
    namespace,
  },
});
export const removeValidationErrorAction = (namespace) => (id) => ({
  type: REMOVE_VALIDATION_ERRORS,
  payload: [id],
  meta: {
    namespace,
  },
});

export const toggleItemSelectionAction = (namespace) => (item) => ({
  type: TOGGLE_ITEM_SELECTION,
  payload: item,
  meta: {
    namespace,
  },
});

export const selectItemsAction = (namespace) => (items) => ({
  type: SELECT_ITEMS,
  payload: items,
  meta: {
    namespace,
  },
});
export const unselectItemsAction = (namespace) => (items) => ({
  type: UNSELECT_ITEMS,
  payload: items,
  meta: {
    namespace,
  },
});

export const toggleAllItemsAction = (namespace) => (items) => ({
  type: TOGGLE_ALL_ITEMS,
  payload: items,
  meta: {
    namespace,
  },
});
export const unselectAllItemsAction = (namespace) => () => ({
  type: UNSELECT_ALL_ITEMS,
  meta: {
    namespace,
  },
});

export const setLastOperationAction = (namespace) => (operationName, operationArgs = {}) => ({
  type: SET_LAST_OPERATION,
  payload: {
    operationName,
    operationArgs,
  },
  meta: {
    namespace,
  },
});

export const createProceedWithValidItemsAction = (namespace) => (
  operationName,
  selectedItems,
  additionalArgs,
) => ({
  type: PROCEED_WITH_VALID_ITEMS,
  payload: {
    name: operationName,
    selectedItems,
    additionalArgs,
  },
  meta: {
    namespace,
  },
});
