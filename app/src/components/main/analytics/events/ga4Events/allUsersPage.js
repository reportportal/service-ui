/*
 * Copyright 2025 EPAM Systems
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

import { getBasicClickEventParameters } from '../common/ga4Utils';

const ALL_USERS_PAGE = 'all_users';

const BASIC_EVENT_PARAMETERS = getBasicClickEventParameters(ALL_USERS_PAGE);

export const ALL_USERS_PAGE_EVENTS = {
  SEARCH_ALL_USERS_FIELD: {
    ...BASIC_EVENT_PARAMETERS,
    place: 'all_users_page',
    element_name: 'search',
  },
  clickApplyFilterButton: (type, condition) => ({
    ...BASIC_EVENT_PARAMETERS,
    modal: 'filter_all_users',
    element_name: 'apply',
    condition,
    type,
  }),
  clickProvideRevokeAdminRights: (provide = true, modal = false) => {
    const name = provide ? 'provide_admin_rights' : 'revoke_admin_rights';
    const additionalParamenters = modal ? { modal: name, element_name: name } : { icon_name: name };

    return {
      ...BASIC_EVENT_PARAMETERS,
      place: 'all_users_page',
      ...additionalParamenters,
    };
  },
};
