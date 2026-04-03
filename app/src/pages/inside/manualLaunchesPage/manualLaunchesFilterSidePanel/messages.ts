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
  containsStatuses: {
    id: 'ManualLaunchesFilterSidePanel.containsStatuses',
    defaultMessage: 'Contains statuses',
  },
  launchCompletion: {
    id: 'ManualLaunchesFilterSidePanel.launchCompletion',
    defaultMessage: 'Launch completion',
  },
  completionAll: {
    id: 'ManualLaunchesFilterSidePanel.completionAll',
    defaultMessage: 'All',
  },
  completionHasNotExecutedTests: {
    id: 'ManualLaunchesFilterSidePanel.completionHasNotExecutedTests',
    defaultMessage: 'Has not executed tests',
  },
  completionDone: {
    id: 'ManualLaunchesFilterSidePanel.completionDone',
    defaultMessage: 'Done',
  },
  startTime: {
    id: 'ManualLaunchesFilterSidePanel.startTime',
    defaultMessage: 'Start time',
  },
  selectStartTime: {
    id: 'ManualLaunchesFilterSidePanel.selectStartTime',
    defaultMessage: 'Select launch start time',
  },
  clearStartTime: {
    id: 'ManualLaunchesFilterSidePanel.clearStartTime',
    defaultMessage: 'Clear start time',
  },
  presetToday: {
    id: 'ManualLaunchesFilterSidePanel.presetToday',
    defaultMessage: 'Today',
  },
  presetLast7Days: {
    id: 'ManualLaunchesFilterSidePanel.presetLast7Days',
    defaultMessage: 'Last 7 days',
  },
  presetLast30Days: {
    id: 'ManualLaunchesFilterSidePanel.presetLast30Days',
    defaultMessage: 'Last 30 days',
  },
  presetLast90Days: {
    id: 'ManualLaunchesFilterSidePanel.presetLast90Days',
    defaultMessage: 'Last 90 days',
  },
  customRange: {
    id: 'ManualLaunchesFilterSidePanel.customRange',
    defaultMessage: 'Custom range',
  },
  customRangePlaceholder: {
    id: 'ManualLaunchesFilterSidePanel.customRangePlaceholder',
    defaultMessage: 'MM-DD-YYYY to MM-DD-YYYY',
  },
  dateRangeSeparator: {
    id: 'ManualLaunchesFilterSidePanel.dateRangeSeparator',
    defaultMessage: '{startDate} to {endDate}',
  },
  filterButton: {
    id: 'ManualLaunchesFilterSidePanel.filterButton',
    defaultMessage: 'Filter launches',
  },
});
