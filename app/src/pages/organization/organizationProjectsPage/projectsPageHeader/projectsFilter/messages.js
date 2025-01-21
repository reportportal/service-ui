/*
 * Copyright 2024 EPAM Systems
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

import { defineMessages } from 'react-intl';

export const messages = defineMessages({
  lastRunDate: {
    id: 'ProjectsFilter.lastRunDate',
    defaultMessage: 'Last Run Date',
  },
  lastRunDatePlaceholder: {
    id: 'ProjectsFilter.lastRunDatePlaceholder',
    defaultMessage: 'Any',
  },
  launches: {
    id: 'ProjectsFilter.launches',
    defaultMessage: 'Launches',
  },
  launchesPlaceholder: {
    id: 'ProjectsFilter.launchesPlaceholder',
    defaultMessage: 'Enter the number of launches',
  },
  users: {
    id: 'ProjectsFilter.users',
    defaultMessage: 'Teammates',
  },
  usersPlaceholder: {
    id: 'ProjectsFilter.usersPlaceholder',
    defaultMessage: 'Enter the number of members',
  },
});
