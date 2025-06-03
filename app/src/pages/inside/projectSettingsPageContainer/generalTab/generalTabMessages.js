/*
 * Copyright 2023 EPAM Systems
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

import { settingsMessages } from 'common/constants/localization/settingsLocalization';
import { defineMessages } from 'react-intl';

export const Messages = {
  ...settingsMessages,
  ...defineMessages({
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
    updateSuccessNotification: {
      id: 'GeneralTab.updateSuccessNotification',
      defaultMessage: 'Project settings were successfully updated',
    },
    updateErrorNotification: {
      id: 'GeneralTab.updateErrorNotification',
      defaultMessage: 'Failed to update project settings',
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
  }),
};
