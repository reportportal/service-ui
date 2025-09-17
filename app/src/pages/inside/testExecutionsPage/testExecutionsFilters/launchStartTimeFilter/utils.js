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

import { messages } from './messages';

export const timeRangeValues = [
  '0;1440;+0300',
  '-1440;1440;+0300',
  '-2880;1440;+0300',
  '-8640;1440;+0300',
  '-41760;1440;+0300',
  '-84960;1440;+0300',
  '-128160;1440;+0300',
];

export const getTimeRange = (formatMessage) => [
  { label: formatMessage(messages.today), value: timeRangeValues[0] },
  { label: formatMessage(messages.last2days), value: timeRangeValues[1] },
  { label: formatMessage(messages.last3days), value: timeRangeValues[2] },
  { label: formatMessage(messages.last7days), value: timeRangeValues[3] },
  { label: formatMessage(messages.last30days), value: timeRangeValues[4] },
  { label: formatMessage(messages.last60days), value: timeRangeValues[5] },
  { label: formatMessage(messages.last90days), value: timeRangeValues[6] },
];
