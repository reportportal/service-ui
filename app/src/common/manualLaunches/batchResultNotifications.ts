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

import { BatchResult, getApiErrorMessage } from 'common/utils/apiResponse';
import { showErrorNotification, showWarningNotification } from 'controllers/notification';

export const getBatchFailedIds = (result: BatchResult): number[] =>
  result.errors.map(({ id }) => Number(id)).filter((id) => Number.isFinite(id));

// Warning toast for a batch that was only partly applied, with the per-item reasons.
export const batchPartialFailureNotificationAction = (result: BatchResult) =>
  showWarningNotification({
    messageId: 'batchPartialFailure',
    values: {
      successCount: result.successCount,
      totalCount: result.totalCount,
      failureCount: result.failureCount,
      errors: [...new Set(result.errors.map(({ message }) => message).filter(Boolean))].join('; '),
    },
  });

// Error toast with the backend message, or the generic text when the response has none.
export const apiErrorNotificationAction = (error: unknown) => {
  const message = getApiErrorMessage(error);

  return showErrorNotification({
    message: message ?? '',
    messageId: message ? '' : 'errorOccurredTryAgain',
  });
};
