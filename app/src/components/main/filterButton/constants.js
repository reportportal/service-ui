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
  CONDITION_NOT_CNT_EVENTS,
  CONDITION_NOT_EQ,
} from 'components/filterEntities/constants';
import { messages } from './messages';

export const LAST_RUN_DATE_FILTER_NAME = 'last_launch_occurred';
export const LAUNCHES_FILTER_NAME = 'launches';
export const TEAMMATES_FILTER_NAME = 'users';
export const FILTER_NAME = 'name';

export const getTimeRange = (formatMessage) => [
  { label: formatMessage(messages.any), value: '' },
  { label: formatMessage(messages.today), value: 'today' },
  { label: formatMessage(messages.last2days), value: 'last2days' },
  { label: formatMessage(messages.last7days), value: 'last7days' },
  { label: formatMessage(messages.last30days), value: 'last30days' },
];

export const getRangeComparisons = (formatMessage) => [
  { label: formatMessage(messages.equals), value: CONDITION_EQ.toUpperCase() },
  { label: formatMessage(messages.greaterOrEqual), value: CONDITION_GREATER_EQ.toUpperCase() },
  { label: formatMessage(messages.lessOrEqual), value: CONDITION_LESS_EQ.toUpperCase() },
];

export const getContainmentComparisons = (formatMessage) => [
  { label: formatMessage(messages.equals), value: CONDITION_EQ.toUpperCase() },
  { label: formatMessage(messages.notEqual), value: CONDITION_NOT_EQ.toUpperCase() },
  { label: formatMessage(messages.contains), value: CONDITION_CNT.toUpperCase() },
  { label: formatMessage(messages.notContains), value: CONDITION_NOT_CNT_EVENTS.toUpperCase() },
];
