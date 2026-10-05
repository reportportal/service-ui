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

import { findCase, getDb, persist, registerCaseAlias, reloadMockDb, resetMockDb } from './db';

const STORAGE_KEY = 'ai_factory_mock_db_v1';
const UNRELATED_STORAGE_KEY = 'unrelated_setting';

describe('AI Factory mock database reset', () => {
  beforeEach(() => {
    localStorage.clear();
    reloadMockDb();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('persists mutations and restores a stable seed baseline', () => {
    expect(resetMockDb()).toBe(true);
    const baseline = JSON.parse(JSON.stringify(getDb()));
    getDb().pipelines[0].name = 'Changed pipeline';
    persist();

    reloadMockDb();
    expect(getDb().pipelines[0].name).toBe('Changed pipeline');

    expect(resetMockDb()).toBe(true);
    expect(getDb()).toEqual(baseline);

    reloadMockDb();
    expect(getDb()).toEqual(baseline);
  });

  test('preserves unrelated local storage and clears transient aliases', () => {
    localStorage.setItem(UNRELATED_STORAGE_KEY, 'keep-me');
    const seededCase = getDb().cases[0];
    const alias = 987654321;
    registerCaseAlias(alias, seededCase);
    expect(findCase(alias)).toBe(seededCase);

    expect(resetMockDb()).toBe(true);

    expect(localStorage.getItem(UNRELATED_STORAGE_KEY)).toBe('keep-me');
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
    expect(findCase(alias)).toBeUndefined();
  });

  test('leaves the current in-memory state intact when persistence fails', () => {
    getDb().pipelines[0].name = 'Unsaved current state';
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded');
    });

    expect(resetMockDb()).toBe(false);
    expect(getDb().pipelines[0].name).toBe('Unsaved current state');
  });
});
