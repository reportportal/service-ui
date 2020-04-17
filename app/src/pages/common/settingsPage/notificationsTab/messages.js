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
import { LAUNCH_CASES } from './constants';

export const messages = defineMessages({
  recipientsLabel: {
    id: 'NotificationCase.recipientsLabel',
    defaultMessage: 'Recipients',
  },
  recipientsPlaceholder: {
    id: 'NotificationCase.recipientsPlaceholder',
    defaultMessage: 'Select team members',
  },
  recipientsHint: {
    id: 'NotificationCase.recipientsHint',
    defaultMessage: 'Please enter correct email',
  },
  launchOwnerLabel: {
    id: 'NotificationCase.launchOwnerLabel',
    defaultMessage: 'Launch owner (who launched - that received)',
  },
  inCaseLabel: {
    id: 'NotificationCase.inCaseLabel',
    defaultMessage: 'In case',
  },
  launchNamesLabel: {
    id: 'NotificationCase.launchNamesLabel',
    defaultMessage: 'Launch names (and)',
  },
  launchNamesPlaceholder: {
    id: 'NotificationCase.launchNamesPlaceholder',
    defaultMessage: 'Select launch names',
  },
  launchNamesHint: {
    id: 'NotificationCase.launchNamesHint',
    defaultMessage: 'Launch name should have size from 1 to 256',
  },
  launchNamesNote: {
    id: 'NotificationCase.launchNamesNote',
    defaultMessage: 'Send notifications about selected launches finished',
  },
  attributesLabel: {
    id: 'NotificationCase.attributesLabel',
    defaultMessage: 'Attributes (and)',
  },
  attributesNote: {
    id: 'NotificationCase.attributesNote',
    defaultMessage: 'Send notifications about launches containing specified attributes',
  },
  [LAUNCH_CASES.ALWAYS]: {
    id: 'NotificationCase.dropdownValueAlways',
    defaultMessage: 'Always',
  },
  [LAUNCH_CASES.MORE_10]: {
    id: 'NotificationCase.dropdownValueMore10',
    defaultMessage: '> 10% of items have issues',
  },
  [LAUNCH_CASES.MORE_20]: {
    id: 'NotificationCase.dropdownValueMore20',
    defaultMessage: '> 20% of items have issues',
  },
  [LAUNCH_CASES.MORE_50]: {
    id: 'NotificationCase.dropdownValueMore50',
    defaultMessage: '> 50% of items have issues',
  },
  [LAUNCH_CASES.FAILED]: {
    id: 'NotificationCase.dropdownValueFailed',
    defaultMessage: 'Launch has issues',
  },
  [LAUNCH_CASES.TO_INVESTIGATE]: {
    id: 'NotificationCase.dropdownValueToInvestigate',
    defaultMessage: 'Launch has "To Investigate" items',
  },
  controlPanelName: {
    id: 'NotificationCase.controlPanelName',
    defaultMessage: 'Rule',
  },
  noItemsMessage: {
    id: 'NoCasesBlock.noItemsMessage',
    defaultMessage: 'No Email Notification Rules',
  },
  notificationsInfo: {
    id: 'NoCasesBlock.notificationsInfo',
    defaultMessage: 'After launches finish, system will notify selected people by email.',
  },
  create: {
    id: 'AddNewCaseButton.addNewRuleButton',
    defaultMessage: 'Create notification',
  },
  toggleLabel: {
    id: 'NotificationsEnableForm.toggleNotificationsLabel',
    defaultMessage: 'E-mail notification',
  },
  toggleNote: {
    id: 'NotificationsEnableForm.toggleNotificationsNote',
    defaultMessage: 'Send e-mail notifications about launches finished',
  },
  title: {
    id: 'NotificationsEnableForm.title',
    defaultMessage: 'No integrations with E-mail',
  },
});
