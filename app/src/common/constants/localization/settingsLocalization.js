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

export const settingsMessages = defineMessages({
  keepLogs: {
    id: 'GeneralTab.keepLogs',
    defaultMessage: 'Keep logs',
  },
  keepLaunches: {
    id: 'GeneralTab.keepLaunches',
    defaultMessage: '​Keep launches',
  },
  keepLaunchesDescription: {
    id: 'GeneralTab.keepLaunchesDescription',
    defaultMessage:
      'How long to keep old launches. A launch and all its descendants (suites, tests, steps, logs) will be deleted. Launch will be deleted from filters and widgets.',
  },
  keepLaunchesTooltip: {
    id: 'GeneralTab.keepLaunchesTooltip',
    defaultMessage: 'Not possible to select value less than for "Keep logs" or "Keep attachments"',
  },
  keepLogsDescription: {
    id: 'GeneralTab.keepLogsDescription',
    defaultMessage:
      'How long to keep old logs in launches. Related launches structure will be saved, in order to keep statistics',
  },
  keepLogsTooltip: {
    id: 'GeneralTab.keepLogsTooltip',
    defaultMessage: 'Not possible to select value less than for "Keep attachments"',
  },
  keepScreenshots: {
    id: 'GeneralTab.keepScreenshots',
    defaultMessage: 'Keep attachments',
  },
  keepScreenshotsDescription: {
    id: 'GeneralTab.keepScreenshotsDescription',
    defaultMessage: 'How long to keep attachments in system',
  },
  minutes15: {
    id: 'GeneralTab.minutes15',
    defaultMessage: '15 minutes',
  },
  hour1: {
    id: 'GeneralTab.hour1',
    defaultMessage: '1 hour',
  },
  hour3: {
    id: 'GeneralTab.hour3',
    defaultMessage: '3 hours',
  },
  hour6: {
    id: 'GeneralTab.hour6',
    defaultMessage: '6 hours',
  },
  hour12: {
    id: 'GeneralTab.hour12',
    defaultMessage: '12 hours',
  },
  hour24: {
    id: 'GeneralTab.hour24',
    defaultMessage: '24 hours',
  },
  day1: {
    id: 'GeneralTab.day1',
    defaultMessage: '1 day',
  },
  week1: {
    id: 'GeneralTab.week1',
    defaultMessage: '7 days',
  },
  week2: {
    id: 'GeneralTab.week2',
    defaultMessage: '14 days',
  },
  week3: {
    id: 'GeneralTab.week3',
    defaultMessage: '21 days',
  },
  month1: {
    id: 'GeneralTab.month1',
    defaultMessage: '30 days',
  },
  month3: {
    id: 'GeneralTab.month3',
    defaultMessage: '90 days',
  },
  month6: {
    id: 'GeneralTab.month6',
    defaultMessage: '180 days',
  },
  forever: {
    id: 'GeneralTab.forever',
    defaultMessage: 'Forever',
  },
});
