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

import { AxiosError } from 'axios';
import { ERROR_CANCELED, ERROR_UNAUTHORIZED } from './fetch';
import { getApiErrorMessage, readBatchResult } from './apiResponse';

describe('getApiErrorMessage', () => {
  it('reads the ErrorRS message', () => {
    expect(getApiErrorMessage({ errorCode: 4091, message: 'Name already exists' })).toBe(
      'Name already exists',
    );
  });

  it('returns undefined for empty or missing messages', () => {
    expect(getApiErrorMessage({ error: 'x' })).toBeUndefined();
    expect(getApiErrorMessage({ errorCode: 4001, message: '  ' })).toBeUndefined();
    expect(getApiErrorMessage(null)).toBeUndefined();
  });

  it('accepts Error instances and strings', () => {
    expect(getApiErrorMessage(new Error('boom'))).toBe('boom');
    expect(getApiErrorMessage('plain')).toBe('plain');
  });

  it('does not surface axios errors or fetch sentinels', () => {
    expect(getApiErrorMessage(new AxiosError('Network Error'))).toBeUndefined();
    expect(getApiErrorMessage(new AxiosError('timeout of 1000ms exceeded'))).toBeUndefined();
    expect(getApiErrorMessage(new Error(ERROR_UNAUTHORIZED))).toBeUndefined();
    expect(getApiErrorMessage(new Error(ERROR_CANCELED))).toBeUndefined();
  });

  it('does not trust messages of bodies that are not ErrorRS', () => {
    // fetch wraps non-JSON error bodies as { message, status }
    expect(
      getApiErrorMessage({ message: 'Request failed with status code 502', status: 502 }),
    ).toBeUndefined();
    expect(getApiErrorMessage({ message: 'Plain failure' })).toBeUndefined();
  });
});

describe('readBatchResult', () => {
  it('reads Batch*OperationResultRS', () => {
    expect(
      readBatchResult({
        totalCount: 3,
        successCount: 2,
        failureCount: 1,
        successTestCaseIds: [1, 2],
        errors: [{ testCaseId: 3, message: 'Not found' }],
      }),
    ).toEqual({
      successIds: [1, 2],
      successCount: 2,
      failureCount: 1,
      totalCount: 3,
      errors: [{ id: 3, message: 'Not found' }],
    });
  });

  it('reads DeleteBulkRS', () => {
    const result = readBatchResult(
      { deleted: [1], notFound: [2], errors: [{ message: 'In progress' }] },
      3,
    );

    expect(result.successIds).toEqual([1]);
    expect(result.failureCount).toBe(2);
    expect(result.successCount).toBe(1);
    expect(result.totalCount).toBe(3);
  });

  it('treats an empty body as a full success of the requested items', () => {
    expect(readBatchResult(undefined, 4)).toEqual({
      successIds: [],
      successCount: 4,
      failureCount: 0,
      totalCount: 4,
      errors: [],
    });
  });
});
