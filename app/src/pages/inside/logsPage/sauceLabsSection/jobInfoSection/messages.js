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
import { COMMANDS_TAB, LOGS_TAB, METADATA_TAB } from './constants';

export const messages = defineMessages({
  commandTitle: {
    id: 'CommandItem.commandTitle',
    defaultMessage: 'Command',
  },
  parametersTitle: {
    id: 'CommandItem.parametersTitle',
    defaultMessage: 'Parameters',
  },
  responseTitle: {
    id: 'CommandItem.responseTitle',
    defaultMessage: 'Response',
  },
  [COMMANDS_TAB]: {
    id: 'JobInfoSection.commands',
    defaultMessage: 'Commands',
  },
  [LOGS_TAB]: {
    id: 'JobInfoSection.logs',
    defaultMessage: 'View Log',
  },
  [METADATA_TAB]: {
    id: 'JobInfoSection.metadata',
    defaultMessage: 'Metadata',
  },
  hasScreenshot: {
    id: 'FiltersBlock.hasScreenshot',
    defaultMessage: 'Has screenshot',
  },
});
