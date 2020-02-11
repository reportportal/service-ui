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
import {
  HIDE_EMPTY_STEPS,
  HIDE_PASSED_LOGS,
  LOG_LEVEL_FILTER_KEY,
  NAMESPACE,
  WITH_ATTACHMENTS_FILTER_KEY,
} from 'controllers/log/constants';
import {
  getHideEmptySteps,
  getHidePassedLogs,
  getLogLevel,
  getWithAttachments,
} from 'controllers/log/storageUtils';
import { pagePropertiesSelector } from 'controllers/pages';

export function* collectLogPayload() {
  const activeProject = yield select(activeProjectSelector);
  const userId = yield select(userIdSelector);
  const query = yield select(querySelector, NAMESPACE);
  const filterLevel = query[LOG_LEVEL_FILTER_KEY] || getLogLevel(userId).id;
  const withAttachments = getWithAttachments(userId) || undefined;
  const hidePassedLogs = getHidePassedLogs(userId) || undefined;
  const hideEmptySteps = getHideEmptySteps(userId) || undefined;
  const activeLogItemId = yield select(activeRetryIdSelector);
  const fullParams = yield select(pagePropertiesSelector, NAMESPACE);
  // prevent duplication of level params in query
  let params = Object.keys(fullParams).reduce((acc, key) => {
    if (key === LOG_LEVEL_FILTER_KEY) {
      return acc;
    }
    return { ...acc, [key]: fullParams[key] };
  }, {});
  params = {
    ...params,
    [WITH_ATTACHMENTS_FILTER_KEY]: withAttachments,
    [HIDE_PASSED_LOGS]: hidePassedLogs,
    [HIDE_EMPTY_STEPS]: hideEmptySteps,
  };
  return {
    activeProject,
    userId,
    params,
    filterLevel,
    withAttachments,
    activeLogItemId,
    query,
    hidePassedLogs,
    hideEmptySteps,
  };
}
