/*
 * Copyright 2026 EPAM Systems
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
  pageTitle: {
    id: 'PipelinesPage.pageTitle',
    defaultMessage: 'Pipelines',
  },
  refreshPage: {
    id: 'PipelinesPage.refreshPage',
    defaultMessage: 'Refresh',
  },
  noPipelines: {
    id: 'PipelinesPage.noPipelines',
    defaultMessage: 'No pipelines found',
  },
  iterationsCount: {
    id: 'PipelinesPage.iterationsCount',
    defaultMessage: '{count} {count, plural, one {iteration} other {iterations}}',
  },
});
