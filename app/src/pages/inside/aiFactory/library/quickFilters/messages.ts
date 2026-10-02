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
  status: {
    id: 'AiFactoryQuickFilters.status',
    defaultMessage: 'Status',
  },
  ai: {
    id: 'AiFactoryQuickFilters.ai',
    defaultMessage: 'AI',
  },
  all: {
    id: 'AiFactoryQuickFilters.all',
    defaultMessage: 'All',
  },
  draft: {
    id: 'AiFactoryQuickFilters.draft',
    defaultMessage: 'Draft',
  },
  ready: {
    id: 'AiFactoryQuickFilters.ready',
    defaultMessage: 'Ready',
  },
  noAi: {
    id: 'AiFactoryQuickFilters.noAi',
    defaultMessage: 'No AI',
  },
  reviewQueue: {
    id: 'AiFactoryQuickFilters.reviewQueue',
    defaultMessage: 'Review queue',
  },
  reviewQueueWithCount: {
    id: 'AiFactoryQuickFilters.reviewQueueWithCount',
    defaultMessage: 'Review queue · {count}',
  },
  iteration: {
    id: 'AiFactoryQuickFilters.iteration',
    defaultMessage: 'Iteration',
  },
  iterationNumber: {
    id: 'AiFactoryQuickFilters.iterationNumber',
    defaultMessage: 'Iteration #{number}',
  },
  removeIteration: {
    id: 'AiFactoryQuickFilters.removeIteration',
    defaultMessage: 'Remove iteration filter',
  },
  clear: {
    id: 'AiFactoryQuickFilters.clear',
    defaultMessage: 'Clear',
  },
});
