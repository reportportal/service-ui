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

const ADMIN_ALL_USERS_PAGE_MODAL = 'Admin all users page modal';
export const ADMIN_ALL_USERS_PAGE_MODAL_EVENTS = {
  CLOSE_ICON_DELETE_MODAL: {
    category: ADMIN_ALL_USERS_PAGE_MODAL,
    action: 'Click on Close Icon on Modal "Delete users"',
    label: 'Close Modal Delete user',
  },
  CANCEL_BTN_DELETE_MODAL: {
    category: ADMIN_ALL_USERS_PAGE_MODAL,
    action: 'Click on Bttn Cancel on Modal "Delete user"',
    label: 'Close Modal Delete user',
  },
  OK_BTN_DELETE_MODAL: {
    category: ADMIN_ALL_USERS_PAGE_MODAL,
    action: 'Click on Bttn Ok on Modal "Delete user"',
    label: 'Delete user',
  },
  UNASSIGN_BTN_CLICK: {
    category: ADMIN_ALL_USERS_PAGE_MODAL,
    action: 'Click on Bttn Unassign',
    label: 'Unassign user',
  },
  CHANGE_PROJECT_ROLE: {
    category: ADMIN_ALL_USERS_PAGE_MODAL,
    action: 'Edit input Project role',
    label: 'Change Project role',
  },
};
