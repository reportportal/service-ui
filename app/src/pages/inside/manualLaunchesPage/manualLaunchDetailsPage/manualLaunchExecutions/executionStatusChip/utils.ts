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

import { ExecutionStatus } from './types';

// TODO Replace getTemporaryStatus with real status from backend when it will be available
export const getTemporaryStatus = (status?: string, startedAt?: number): ExecutionStatus => {
  if (status) {
    return status.toUpperCase() as ExecutionStatus;
  }

  // TODO Remove this temporary logic when real status will be available from backend. This is just for demonstration of different status icons in UI.
  if (startedAt) {
    return startedAt % 2 === 0 ? ExecutionStatus.IN_PROGRESS : ExecutionStatus.PASSED;
  }

  return ExecutionStatus.TO_RUN;
};
