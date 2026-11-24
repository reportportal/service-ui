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
// bumped on every clear, so a request that started before the clear cannot repopulate the cache
let generation = 0;

const getKey = (projectKey, widgetId) => `${projectKey}/${widgetId}`;

// an entry older than maxAge is not served, the widget loads as usual
export const getCachedWidget = (projectKey, widgetId, maxAge = Infinity) => {
  const key = getKey(projectKey, widgetId);
  const entry = cache.get(key);
  if (entry && Date.now() - entry.fetchedAt >= maxAge) {
    cache.delete(key);
    return undefined;
  }
  return entry;
};

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

export const getWidgetCacheGeneration = () => generation;

export const clearWidgetCache = () => {
  generation += 1;
  cache.clear();
};

// requestGeneration is the generation read when the request started: a payload loaded for the
// previous session or project is dropped
export const cacheLoadedWidget = (
  projectKey,
  widgetId,
  widget,
  isDrilledDown,
  requestGeneration = generation,
) => {
  if (requestGeneration !== generation) {
    return;
  }
  if (isDrilledDown) {
    removeCachedWidget(projectKey, widgetId);
  } else {
    setCachedWidget(projectKey, widgetId, { widget });
  }
};
