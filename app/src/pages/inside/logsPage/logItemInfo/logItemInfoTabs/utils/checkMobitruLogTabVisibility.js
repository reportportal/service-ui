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

export const MOBITRU_VIDEO_SUBTREE_VISIBILITY_MODE = 'mobitruVideoSubtree';

export const isMobitruVideoSubtreeTab = (extension) =>
  extension.payload?.visibilityMode === MOBITRU_VIDEO_SUBTREE_VISIBILITY_MODE ||
  extension.payload?.tabElementName === 'remote_device';

export const checkMobitruLogTabVisibility = async ({
  fetchFn,
  projectKey,
  activeRetryPath,
  excludedRetryParentId,
}) => {
  const url = URLS.logsUnderPath(projectKey, activeRetryPath, excludedRetryParentId);
  const response = await fetchFn(url, {
    params: {
      'filter.eq.level': 'mobitru',
      'filter.ex.binaryContent': true,
      'page.size': 1,
      'page.page': 1,
    },
  });

  return Boolean(response?.content?.length);
};
