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

import { getCachedWidget, setCachedWidget, removeCachedWidget } from './widgetCache';

describe('widgetCache', () => {
  test('returns the last payload of a widget with the time it was loaded', () => {
    setCachedWidget('p', 1, { widget: { id: 1 }, queryParameters: {} });
    const cached = getCachedWidget('p', 1);

    expect(cached.widget).toEqual({ id: 1 });
    expect(typeof cached.fetchedAt).toBe('number');
    expect(getCachedWidget('other', 1)).toBeUndefined();
    removeCachedWidget('p', 1);
    expect(getCachedWidget('p', 1)).toBeUndefined();
  });

  test('keeps a bounded number of widgets', () => {
    for (let i = 0; i < 150; i += 1) {
      setCachedWidget('p', i, { widget: { id: i } });
    }
    expect(getCachedWidget('p', 0)).toBeUndefined();
    expect(getCachedWidget('p', 149).widget).toEqual({ id: 149 });
  });
});
