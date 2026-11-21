/*
 * Copyright 2026 EPAM Systems
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

import { uniq } from 'es-toolkit';

import type { BatchResult } from 'common/utils/apiResponse';
import { showWarningNotification } from 'controllers/notification';

const MAX_LISTED_ERRORS = 3;

// Warning toast for a batch request where only part of the items were processed.
export const batchPartialFailureNotification = ({
  successCount,
  totalCount,
  failureCount,
  errors,
}: BatchResult) =>
  showWarningNotification({
    messageId: 'batchPartialFailure',
    values: {
      successCount,
      totalCount,
      failureCount,
      errors: uniq(errors.map(({ message }) => message).filter(Boolean))
        .slice(0, MAX_LISTED_ERRORS)
        .join(' '),
    },
  });
