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

export const Messages = defineMessages({
  projectNameLabel: {
    id: 'GeneralTab.projectNameLabel',
    defaultMessage: 'Name',
  },
  interruptedJob: {
    id: 'GeneralTab.interruptedJob',
    defaultMessage: 'Launch inactivity timeout',
  },
  interruptedJobDescription: {
    id: 'GeneralTab.interruptedJobDescription',
    defaultMessage: 'Schedule time for Job to interrupt inactive launches',
  },
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
      'How long to keep old launches. A launch and all it descendants (suites, tests, steps, logs) will be deleted. Launch will be deleted from filters and widgets.',
  },
  keepLogsDescription: {
    id: 'GeneralTab.keepLogsDescription',
    defaultMessage:
      'How long to keep old logs in launches. Related launches structure will be saved, in order to keep statistics',
  },
  keepScreenshots: {
    id: 'GeneralTab.keepScreenshots',
    defaultMessage: 'Keep attachments',
  },
  keepScreenshotsDescription: {
    id: 'GeneralTab.keepScreenshotsDescription',
    defaultMessage: 'How long to keep attachments in system',
  },
  updateSuccessNotification: {
    id: 'GeneralTab.updateSuccessNotification',
    defaultMessage: 'Project settings were successfully updated',
  },
  updateErrorNotification: {
    id: 'GeneralTab.updateErrorNotification',
    defaultMessage: 'Failed to update project settings',
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
