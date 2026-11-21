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

import { getTestPlansSearchUri } from './getTestPlansSearchUri';

describe('getTestPlansSearchUri', () => {
  const getParams = (uri: string) => new URLSearchParams(uri.split('?')[1]);

  test('sorts by createdAt using the sort parameter the API reads', () => {
    const params = getParams(getTestPlansSearchUri('project', ''));

    expect(params.get('sort')).toBe('createdAt,desc');
    expect(params.has('sortBy')).toBe(false);
    expect(params.get('filter.ex.milestoneId')).toBe('true');
    expect(params.get('limit')).toBe('50');
    expect(params.get('offset')).toBe('0');
    expect(params.has('filter.cnt.name')).toBe(false);
  });

  test('adds the name filter when searching', () => {
    const params = getParams(getTestPlansSearchUri('project', 'plan'));

    expect(params.get('filter.cnt.name')).toBe('plan');
    expect(params.get('sort')).toBe('createdAt,desc');
  });
});
