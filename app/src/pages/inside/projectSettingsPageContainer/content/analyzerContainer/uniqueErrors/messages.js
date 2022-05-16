/*
 * Copyright 2022 EPAM Systems
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
  tabDescription: {
    id: 'UniqueErrors.tabDescription',
    defaultMessage:
      'Unique error analysis detects all unique error logs in the launch and forms them into clusters with relevant failed test items. Unique errors clusters could be found on "Unique Errors" tab on test item levels',
  },
  uniqueError: {
    id: 'UniqueErrors.uniqueError',
    defaultMessage: 'Auto-Unique Error',
  },
  uniqueErrorDescription: {
    id: 'UniqueErrors.uniqueErrorDescription',
    defaultMessage:
      'If Auto-Unique Error is active analysis starts as soon as any launch is finished',
  },
  analyzedErrorLogs: {
    id: 'UniqueErrors.analyzedErrorLogs',
    defaultMessage: 'Analyzed Error Logs',
  },
  analyzedErrorLogsDescription: {
    id: 'UniqueErrors.analyzedErrorLogsDescription',
    defaultMessage: 'Logs can be analyzed with or without numbers',
  },
  uniqueErrAnalyzeModalIncludeNumbers: {
    id: 'UniqueErrors.uniqueErrAnalyzeModalIncludeNumbers',
    defaultMessage: 'Include numbers to analyzed logs',
  },
  uniqueErrAnalyzeModalExcludeNumbers: {
    id: 'UniqueErrors.uniqueErrAnalyzeModalExcludeNumbers',
    defaultMessage: 'Exclude numbers from analyzed logs',
  },
});
