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

import { defineMessages } from 'react-intl';

export const LAUNCHES_PER_WEEK = 'launchesPerWeek';
export const LAUNCHES_QUANTITY = 'launchesQuantity';
export const USERS_QUANTITY = 'usersQuantity';
export const UNIQUE_TICKETS = 'uniqueTickets';

const messages = defineMessages({
  [LAUNCHES_QUANTITY]: {
    id: 'GeneralInfo.launchesQuantity',
    defaultMessage: 'launches',
  },
  [LAUNCHES_PER_WEEK]: {
    id: 'GeneralInfo.launchesPerWeek',
    defaultMessage: 'launches average per week',
  },
  [USERS_QUANTITY]: {
    id: 'GeneralInfo.usersQuantity',
    defaultMessage: 'members',
  },
  [UNIQUE_TICKETS]: {
    id: 'GeneralInfo.uniqueTickets',
    defaultMessage: 'unique bug posted',
  },
});

export const INFO_CONFIG = {
  [LAUNCHES_QUANTITY]: messages[LAUNCHES_QUANTITY],
  [LAUNCHES_PER_WEEK]: messages[LAUNCHES_PER_WEEK],
  [USERS_QUANTITY]: messages[USERS_QUANTITY],
  [UNIQUE_TICKETS]: messages[UNIQUE_TICKETS],
};
