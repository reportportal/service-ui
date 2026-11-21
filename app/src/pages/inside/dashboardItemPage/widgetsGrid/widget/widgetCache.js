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

// Last loaded payload of every widget, so a widget that LazyLoad unmounts while scrolled out of view
// renders instantly when it comes back and does not re-request data that is still fresh.
const MAX_CACHED_WIDGETS = 100;
const cache = new Map();

const getKey = (projectKey, widgetId) => `${projectKey}/${widgetId}`;

export const getCachedWidget = (projectKey, widgetId) => cache.get(getKey(projectKey, widgetId));

export const setCachedWidget = (projectKey, widgetId, data) => {
  const key = getKey(projectKey, widgetId);
  cache.delete(key);
  cache.set(key, { ...data, fetchedAt: Date.now() });
  if (cache.size > MAX_CACHED_WIDGETS) {
    cache.delete(cache.keys().next().value);
  }
};

export const removeCachedWidget = (projectKey, widgetId) => {
  cache.delete(getKey(projectKey, widgetId));
};
