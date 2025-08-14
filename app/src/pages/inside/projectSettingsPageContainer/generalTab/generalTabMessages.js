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

import { defineMessages } from 'react-intl';

export const messages = defineMessages({
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
});
