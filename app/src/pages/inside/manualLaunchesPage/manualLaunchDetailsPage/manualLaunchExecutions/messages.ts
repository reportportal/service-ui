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
  nameColumn: {
    id: 'ManualLaunchExecutions.nameColumn',
    defaultMessage: 'Name',
  },
  stepsColumn: {
    id: 'ManualLaunchExecutions.stepsColumn',
    defaultMessage: 'Steps',
  },
  statusColumn: {
    id: 'ManualLaunchExecutions.statusColumn',
    defaultMessage: 'Status',
  },
  allTestExecutions: {
    id: 'ManualLaunchExecutions.allTestExecutions',
    defaultMessage: 'All test executions',
  },
  searchPlaceholder: {
    id: 'ManualLaunchExecutions.searchPlaceholder',
    defaultMessage: 'Search executions...',
  },
  noExecutions: {
    id: 'ManualLaunchExecutions.noExecutions',
    defaultMessage: 'No test executions in this folder',
  },
  noResultsDescription: {
    id: 'ManualLaunchExecutions.noResultsDescription',
    defaultMessage:
      "Your search or filter criteria didn't match any results. Please try different keywords or adjust your filter settings.",
  },
  deleteExecution: {
    id: 'ManualLaunchExecutions.deleteExecution',
    defaultMessage: 'Delete',
  },
});
