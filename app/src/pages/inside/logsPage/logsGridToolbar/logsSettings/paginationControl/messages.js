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
  turnOff: {
    id: 'LogsSettings.pagination.turnOff',
    defaultMessage: 'Turn Off Pagination',
  },
  turnOn: {
    id: 'LogsSettings.pagination.turnOn',
    defaultMessage: 'Turn On Pagination',
  },
  turnOffDescription: {
    id: 'LogsSettings.pagination.turnOffDescription',
    defaultMessage: 'You need to reload the page to disable pagination.',
  },
  turnOnDescription: {
    id: 'LogsSettings.pagination.turnOnDescription',
    defaultMessage: 'You need to reload the page to enable pagination.',
  },
  turnOffNote: {
    id: 'LogsSettings.pagination.turnOffNote',
    defaultMessage: 'This option will remain enabled until you manually turn pagination back on.',
  },
  turnOffAndReload: {
    id: 'LogsSettings.pagination.turnOffReload',
    defaultMessage: 'Turn Off & Reload',
  },
  turnOnAndReload: {
    id: 'LogsSettings.pagination.turnOnReload',
    defaultMessage: 'Turn On & Reload',
  },
});
