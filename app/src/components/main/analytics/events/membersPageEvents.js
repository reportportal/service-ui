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

export const MEMBERS_PAGE = 'members';
export const MEMBERS_PAGE_EVENTS = {
  ENTER_SEARCH_PARAM: {
    category: MEMBERS_PAGE,
    action: 'Enter parameter for search',
    label: 'Show member by parameter',
  },
  PERMISSION_MAP_CLICK: {
    category: MEMBERS_PAGE,
    action: 'Click on Btn Permission map',
    label: 'Show Permission map',
  },
  INVITE_USER_CLICK: {
    category: MEMBERS_PAGE,
    action: 'Click on Btn Invite user',
    label: 'Arise Modal Invite user',
  },
  CHANGE_PROJECT_ROLE: {
    category: MEMBERS_PAGE,
    action: 'Edit input Project role',
    label: 'Change Project role',
  },
  UNASSIGN_BTN_CLICK: {
    category: MEMBERS_PAGE,
    action: 'Click on Btn Unassign',
    label: 'Unassign user',
  },
  CLOSE_ICON_INVITE_USER_MODAL: {
    category: MEMBERS_PAGE,
    action: 'Click on icon Close on Modal Invite user',
    label: 'Close Modal Invite user',
  },
  CANCEL_BTN_INVITE_USER_MODAL: {
    category: MEMBERS_PAGE,
    action: 'Click on Btn Cancel on Modal Invite user',
    label: 'Close Modal Invite user',
  },
  INVITE_BTN_INVITE_USER_MODAL: {
    category: MEMBERS_PAGE,
    action: 'Click on Btn Invite on Modal Invite user',
    label: 'Invite user',
  },
};
