/*
 * Copyright 2024 EPAM Systems
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

import {
  CONDITION_CNT,
  CONDITION_EQ,
  CONDITION_GREATER_EQ,
  CONDITION_LESS_EQ,
  CONDITION_NOT_CNT,
  CONDITION_NOT_EQ,
} from 'components/filterEntities/constants';
import { ADMINISTRATOR, USER } from 'common/constants/accountRoles';
import { messages } from './messages';

export const ORGANIZATION_TYPE_FILTER_NAME = 'type';
export const LAST_RUN_DATE_FILTER_NAME = 'last_launch_occurred';
export const LAUNCHES_FILTER_NAME = 'launches';
export const LAUNCHES_FILTER_NAME_CONDITION = 'launches_condition';
export const TEAMMATES_FILTER_NAME = 'users';
export const TEAMMATES_FILTER_NAME_CONDITION = 'users_condition';
export const USERS_PERMISSIONS_FILTER_NAME = 'instance_role';
export const ACCOUNT_TYPE_FILTER_NAME = 'account_type';
export const LAST_LOGIN_FILTER_NAME = 'lastLogin';
export const EMAIL_FILTER_NAME = 'email';
export const EMAIL_FILTER_NAME_CONDITION = 'email_condition';

export const getTimeRange = (formatMessage) => [
  { label: formatMessage(messages.any), value: '' },
  { label: formatMessage(messages.today), value: 'today' },
  { label: formatMessage(messages.last2days), value: 'last2days' },
  { label: formatMessage(messages.last7days), value: 'last7days' },
  { label: formatMessage(messages.last30days), value: 'last30days' },
];

export const getLastLogin = (formatMessage) => [
  { label: formatMessage(messages.any), value: '' },
  { label: formatMessage(messages.last7days), value: 'last7days' },
  { label: formatMessage(messages.last30days), value: 'last30days' },
  { label: formatMessage(messages.last90days), value: 'last90days' },
  { label: formatMessage(messages.moreThanYearAgo), value: 'moreThanYearAgo' },
];

export const getRangeComparisons = (formatMessage) => [
  { label: formatMessage(messages.equals), value: CONDITION_EQ.toUpperCase() },
  { label: formatMessage(messages.greaterOrEqual), value: CONDITION_GREATER_EQ.toUpperCase() },
  { label: formatMessage(messages.lessOrEqual), value: CONDITION_LESS_EQ.toUpperCase() },
];

export const getEmailComparisons = (formatMessage) => [
  { label: formatMessage(messages.contains), value: CONDITION_CNT.toUpperCase() },
  { label: formatMessage(messages.notContains), value: CONDITION_NOT_CNT.toUpperCase() },
  { label: formatMessage(messages.equals), value: CONDITION_EQ.toUpperCase() },
  { label: formatMessage(messages.notEqual), value: CONDITION_NOT_EQ.toUpperCase() },
];

export const getPermissions = (formatMessage) => [
  { label: formatMessage(messages.all), value: '' },
  { label: formatMessage(messages.adminsOnly), value: ADMINISTRATOR },
  { label: formatMessage(messages.nonAdmins), value: USER },
];

export const getAccountTypes = (formatMessage) => [
  { label: formatMessage(messages.typeInternal), value: 'internal' },
  { label: formatMessage(messages.typeSynched), value: 'synched' },
  { label: formatMessage(messages.gitHub), value: 'github' },
  { label: formatMessage(messages.ldap), value: 'ldap' },
  { label: formatMessage(messages.saml), value: 'saml' },
  { label: formatMessage(messages.scim), value: 'scim' },
];
