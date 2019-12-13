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

import { EXECUTE_GROUP_OPERATION } from './constants';

export const validateItems = (items = [], validator, state) =>
  items.reduce((acc, item) => {
    const error = validator(item, items, state);
    if (error) {
      return { ...acc, [item.id]: error };
    }
    return acc;
  }, {});

const groupOperationMap = {};

export const getGroupOperationDescriptor = (name) => groupOperationMap[name];

export const defineGroupOperation = (namespace, name, operationAction, validator) => {
  groupOperationMap[name] = {
    action: operationAction,
    validator,
  };
  return (selectedItems, additionalArgs) => ({
    type: EXECUTE_GROUP_OPERATION,
    payload: {
      name,
      selectedItems,
      additionalArgs,
    },
    meta: {
      namespace,
    },
  });
};
