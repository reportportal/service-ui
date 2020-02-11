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

import { REGEX_PATTERN, STRING_PATTERN } from 'common/constants/patternTypes';
import { defineMessages } from 'react-intl';

export const messages = defineMessages({
  noItemsMessage: {
    id: 'PatternAnalysis.noItemsMessage',
    defaultMessage: 'No Pattern Rules',
  },
  notificationsInfo: {
    id: 'PatternAnalysis.notificationsInfo',
    defaultMessage:
      'System can analyze test results automatically by comparing test result stack trace with saved patterns in the system.',
  },
  create: {
    id: 'PatternAnalysis.createPattern',
    defaultMessage: 'Create pattern',
  },
  createPatternTitle: {
    id: 'PatternAnalysis.createPatternMessage',
    defaultMessage: 'Create pattern rule',
  },
  toggleLabel: {
    id: 'PatternAnalysis.title',
    defaultMessage: 'Pattern-Analysis',
  },
  toggleNote: {
    id: 'PatternAnalysis.enablePA',
    defaultMessage:
      'If ON - analysis starts as soon as any launch finished<br/>If OFF - not automatic, but can be invoked manually',
  },
  deleteModalHeader: {
    id: 'PatternAnalysis.deleteModalHeader',
    defaultMessage: 'Delete Pattern Rule',
  },
  deleteModalContent: {
    id: 'PatternAnalysis.deleteModalContent',
    defaultMessage: 'Are you sure you want to delete pattern rule {name}?',
  },
  clonePatternMessage: {
    id: 'PatternAnalysis.clonePatternMessage',
    defaultMessage: 'Clone pattern rule',
  },
  [REGEX_PATTERN]: {
    id: 'PatternAnalysis.RegExp',
    defaultMessage: 'RegExp',
  },
  [STRING_PATTERN]: {
    id: 'PatternAnalysis.String',
    defaultMessage: 'String',
  },
});
