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

import { defineMessages } from 'react-intl';

export const messages = defineMessages({
  lockedDashboard: {
    id: 'LockedDashboardTooltip.lockedDashboard',
    defaultMessage:
      'This dashboard is locked by a project manager or administrator and cannot be modified',
  },
  lockedFilter: {
    id: 'LockedDashboardTooltip.lockedFilter',
    defaultMessage:
      'The filter is associated with a dashboard locked by a project manager or administrator and is not available for editing',
  },
  lockedFilterIntro: {
    id: 'LockedDashboardTooltip.lockedFilterIntro',
    defaultMessage: 'This filter is locked and used by the following locked dashboards:',
  },
  lockedFilterMore: {
    id: 'LockedDashboardTooltip.lockedFilterMore',
    defaultMessage: '+ {count} more',
  },
});
