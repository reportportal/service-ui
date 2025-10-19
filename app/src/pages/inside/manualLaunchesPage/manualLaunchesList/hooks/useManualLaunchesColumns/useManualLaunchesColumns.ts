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

import { useIntl } from 'react-intl';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { messages } from 'pages/inside/manualLaunchesPage/messages';

export const useManualLaunchesColumns = () => {
  const { formatMessage } = useIntl();

  const primaryColumn = {
    key: 'count',
    header: '#',
    width: 80,
    align: 'center' as const,
  };

  const fixedColumns = [
    {
      key: 'name',
      header: formatMessage(COMMON_LOCALE_KEYS.NAME),
      width: 164,
      align: 'left' as const,
    },
    {
      key: 'startTime',
      header: formatMessage(COMMON_LOCALE_KEYS.START_TIME),
      width: 155,
      align: 'left' as const,
    },
    {
      key: 'totalTests',
      header: formatMessage(COMMON_LOCALE_KEYS.TOTAL),
      width: 80,
      align: 'right' as const,
    },
    {
      key: 'testRunStatus',
      header: '',
      width: 110,
      align: 'left' as const,
    },
    {
      key: 'failedTests',
      header: formatMessage(COMMON_LOCALE_KEYS.FAILED),
      width: 100,
      align: 'left' as const,
    },
    {
      key: 'testsToRun',
      header: formatMessage(messages.toRun),
      width: 80,
      align: 'center' as const,
    },
  ];

  return { primaryColumn, fixedColumns };
};
