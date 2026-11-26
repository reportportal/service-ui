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

import axios from 'axios';
import { ERROR_CANCELED, ERROR_UNAUTHORIZED } from './fetch';

const readMessage = (message: unknown): string | undefined =>
  typeof message === 'string' && message.trim() ? message : undefined;

// A message worth showing to the user: the ErrorRS body ({ errorCode, message }) that fetch
// rethrows from error.response.data, or a string / Error a caller passes on purpose. Anything else
// (axios errors such as "Network Error", fetch sentinels such as UNAUTHORIZED or REQUEST_CANCELED,
// non-ErrorRS bodies) yields undefined, so the caller shows its generic message instead.
export const getApiErrorMessage = (error: unknown): string | undefined => {
  if (typeof error === 'string') {
    return error.trim() || undefined;
  }
  if (error instanceof Error) {
    const isInternal =
      axios.isAxiosError(error) ||
      error.message === ERROR_CANCELED ||
      error.message === ERROR_UNAUTHORIZED;
    return isInternal ? undefined : readMessage(error.message);
  }
  const body = error as { errorCode?: unknown; message?: unknown } | null | undefined;
  return typeof body?.errorCode === 'number' ? readMessage(body.message) : undefined;
};

export interface BatchItemError {
  id?: number | string;
  message: string;
}

export interface BatchResult {
  successIds: Array<number | string>;
  successCount: number;
  failureCount: number;
  totalCount: number;
  errors: BatchItemError[];
}

const toError = (raw: unknown): BatchItemError => {
  if (typeof raw === 'string') {
    return { message: raw };
  }
  const item = (raw ?? {}) as Record<string, unknown>;
  const id = item.testCaseId ?? item.launchId ?? item.executionId ?? item.id;
  const message = readMessage(item.errorMessage) ?? readMessage(item.message) ?? '';
  return { id: id as number | string | undefined, message };
};

// Normalises the batch responses of the API (Batch*OperationResultRS,
// BatchDeleteTestCaseExecutionsResultRS and DeleteBulkRS) so callers
// can tell a full success from a partial one instead of trusting the number of requested ids.
export const readBatchResult = (response: unknown, requestedCount = 0): BatchResult => {
  const rs = (response ?? {}) as Record<string, unknown>;
  const successIds = (rs.successTestCaseIds ??
    rs.successLaunchIds ??
    rs.successExecutionIds ??
    rs.successIds ??
    rs.deleted ??
    []) as Array<number | string>;
  const errors = [
    ...((rs.errors as unknown[]) ?? []),
    ...((rs.notFound as unknown[]) ?? []).map((id) => ({ id, message: '' })),
  ].map(toError);
  const failureCount = typeof rs.failureCount === 'number' ? rs.failureCount : errors.length;
  const totalCount =
    typeof rs.totalCount === 'number'
      ? rs.totalCount
      : Math.max(requestedCount, successIds.length + failureCount);
  const successCount =
    typeof rs.successCount === 'number' ? rs.successCount : Math.max(totalCount - failureCount, 0);

  return { successIds, successCount, failureCount, totalCount, errors };
};
