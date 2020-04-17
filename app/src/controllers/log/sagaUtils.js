/*
 * Copyright 2019 EPAM Systems
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

import { select } from 'redux-saga/effects';
import { activeProjectSelector, userIdSelector } from 'controllers/user';
import { activeRetryIdSelector, querySelector } from 'controllers/log/selectors';
import { LOG_LEVEL_FILTER_KEY, NAMESPACE } from 'controllers/log/constants';
import { getLogLevel } from 'controllers/log/storageUtils';

export function* collectLogPayload() {
  const activeProject = yield select(activeProjectSelector);
  const userId = yield select(userIdSelector);
  const query = yield select(querySelector, NAMESPACE);
  const filterLevel = query[LOG_LEVEL_FILTER_KEY] || getLogLevel(userId).id;
  const activeLogItemId = yield select(activeRetryIdSelector);

  return {
    activeProject,
    userId,
    filterLevel,
    activeLogItemId,
    query,
  };
}
