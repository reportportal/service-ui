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
  defineGroupOperation,
  toggleItemSelectionAction,
  toggleAllItemsAction,
  unselectAllItemsAction,
} from 'controllers/groupOperations';
import { showModalAction } from 'controllers/modal';
import { FETCH_ALL_USERS, NAMESPACE, TOGGLE_USER_ROLE_FORM } from './constants';
import { validateDeleteUser } from './actionValidators';

export const fetchAllUsersAction = () => ({
  type: FETCH_ALL_USERS,
});

export const toggleUserSelectionAction = toggleItemSelectionAction(NAMESPACE);
export const toggleAllUsersAction = toggleAllItemsAction(NAMESPACE);
export const unselectAllUsersAction = unselectAllItemsAction(NAMESPACE);

export const toggleUserRoleFormAction = (userId, value) => ({
  type: TOGGLE_USER_ROLE_FORM,
  payload: {
    userId,
    value,
  },
});

export const deleteItemsAction = defineGroupOperation(
  NAMESPACE,
  'deleteUsers',
  (items, { onConfirm, header, mainContent, eventsInfo }) =>
    showModalAction({
      id: 'deleteItemsModal',
      data: { items, onConfirm, header, mainContent, eventsInfo },
    }),
  validateDeleteUser,
);
