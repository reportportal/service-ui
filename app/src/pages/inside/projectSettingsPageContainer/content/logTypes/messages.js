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
  createLogType: {
    id: 'LogTypes.createLogType',
    defaultMessage: 'Create log type',
  },
  description: {
    id: 'LogTypes.description',
    defaultMessage:
      'Log types help visually highlight the importance of events at specific moments. Each log entry has a type. You can customize log types to fit your needs. Some core types are reserved by default, but you can add and configure your own. More information about log types you can read in <a>Documentation</a>',
  },
  color: {
    id: 'LogTypes.color',
    defaultMessage: 'Color',
  },
  typeName: {
    id: 'LogTypes.typeName',
    defaultMessage: 'Type name',
  },
  logLevel: {
    id: 'LogTypes.logLevel',
    defaultMessage: 'Log level',
  },
  colorPalette: {
    id: 'LogTypes.colorPalette',
    defaultMessage: 'Color palette preview',
  },
  showInFilter: {
    id: 'LogTypes.showInFilter',
    defaultMessage: 'Show in log filter',
  },
  systemLogTypeTooltip: {
    id: 'LogTypes.systemLogTypeTooltip',
    defaultMessage: 'This is a system log type and cannot be deleted',
  },
  noMoreFilterableLogTypesTooltip: {
    id: 'LogTypes.noMoreFilterableLogTypesTooltip',
    defaultMessage:
      'Only 6 log types can be active at the same time in the filter slider. Disable another log type to enable this one.',
  },
  noPermissionsToUpdateTooltip: {
    id: 'LogTypes.noPermissionsToUpdateTooltip',
    defaultMessage: 'You do not have enough permissions to update log types.',
  },
});
