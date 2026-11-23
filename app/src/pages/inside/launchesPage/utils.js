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
import { IN_PROGRESS } from 'common/constants/testStatuses';

// DeleteBulkRS answers 200 even when some launches were not deleted: the launches that are not
// listed in `successfullyDeleted` failed (their ErrorRS entries carry no id).
export const getDeleteLaunchesResult = (items, response) => {
  const deleted = response?.successfullyDeleted ?? response?.deleted;
  const result = readBatchResult(response && { ...response, deleted }, items.length);
  const messages = [...new Set(result.errors.map(({ message }) => message).filter(Boolean))];
  const errorsText = messages.join(' ');
  // without the list of deleted ids the failed launches are unknown, only their number is
  if (!Array.isArray(deleted)) {
    return { ...result, failedItems: [], errorsText };
  }
  const deletedIds = result.successIds.map(String);
  const failedItems = items.filter((item) => !deletedIds.includes(String(item.id)));
  return {
    ...result,
    successCount: items.length - failedItems.length,
    failureCount: failedItems.length,
    totalCount: items.length,
    failedItems,
    errorsText,
  };
};

// Applies a launch status poll answer: only the launches that were asked about can be finished, so
// launches that appeared while the request was in flight stay in progress until the next poll.
export const getFinishedLaunchesUpdate = ({
  requestedIds = [],
  launchesWithStatus = {},
  launchesInProgress = [],
  launches = [],
}) => {
  const finishedIds = requestedIds.filter(
    (id) => launchesInProgress.includes(id) && launchesWithStatus[id] !== IN_PROGRESS,
  );
  if (!finishedIds.length) {
    return null;
  }
  const endTime = Date.now();
  return {
    launchesInProgress: launchesInProgress.filter((id) => !finishedIds.includes(id)),
    finishedCount: finishedIds.length,
    finishedLaunches: launches
      .filter(
        (item) => finishedIds.includes(item.id) && !item.endTime && launchesWithStatus[item.id],
      )
      .map((item) => ({ ...item, endTime, status: launchesWithStatus[item.id] })),
  };
};
