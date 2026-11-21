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

import { readBatchResult } from 'common/utils/apiResponse';

// DeleteBulkRS answers 200 even when some launches were not deleted: the launches that are not
// listed in `deleted` failed (their ErrorRS entries carry no id).
export const getDeleteLaunchesResult = (items, response) => {
  const result = readBatchResult(response, items.length);
  if (!Array.isArray(response?.deleted)) {
    return { ...result, failedItems: [] };
  }
  const deletedIds = result.successIds.map(String);
  const failedItems = items.filter((item) => !deletedIds.includes(String(item.id)));
  const messages = [...new Set(result.errors.map(({ message }) => message).filter(Boolean))];
  return {
    ...result,
    successCount: items.length - failedItems.length,
    failureCount: failedItems.length,
    totalCount: items.length,
    failedItems,
    errorsText: messages.join(' '),
  };
};
