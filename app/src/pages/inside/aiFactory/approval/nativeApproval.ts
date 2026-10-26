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

import { URLS } from 'common/urls';
import { fetch } from 'common/utils';

export class NativeApprovalError extends Error {
  readonly reason: 'CONFLICT' | 'FAILED';

  constructor(reason: 'CONFLICT' | 'FAILED') {
    super(reason);
    this.reason = reason;
    this.name = 'NativeApprovalError';
  }
}

const isReviewConflict = (error: unknown): boolean =>
  typeof error === 'object' && error !== null && 'errorCode' in error && error.errorCode === 40915;

export const approveNativeTestCase = async (
  projectKey: string,
  testCaseId: number,
  signal: AbortSignal,
): Promise<void> => {
  try {
    const response = await fetch(
      URLS.testCaseDetails(projectKey, testCaseId),
      {
        method: 'PATCH',
        data: { status: 'READY' },
        signal,
        validateStatus: (status) => (status >= 200 && status < 300) || status === 409,
      },
      true,
    );
    if (response.status === 409) throw new NativeApprovalError('CONFLICT');
  } catch (error: unknown) {
    if (error instanceof NativeApprovalError) throw error;
    throw new NativeApprovalError(isReviewConflict(error) ? 'CONFLICT' : 'FAILED');
  }
};
