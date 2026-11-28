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

import { runSaga } from 'redux-saga';

import { URLS } from 'common/urls';
import { fetch } from 'common/utils/fetch';

import {
  TMS_USER_SETTINGS_KEYS,
  TMS_USER_SETTINGS_KEY_PREFIXES,
  TMS_USER_SETTINGS_MIGRATED_KEY,
} from './constants';
import { updateTmsUserSettingsAction } from './actionCreators';
import { syncTmsUserSettings, updateTmsUserSettings } from './sagas';

jest.mock('common/utils/fetch', () => ({
  fetch: jest.fn(),
}));

const fetchMock = fetch as unknown as jest.Mock;
const USER_ID = 7;
const PROJECT_KEY = 'project_a';
const SETTINGS_KEY = `${USER_ID}_settings`;
const MIGRATED = [...TMS_USER_SETTINGS_KEYS, ...TMS_USER_SETTINGS_KEY_PREFIXES];
const state = { user: { info: { userId: USER_ID }, activeProjectKey: PROJECT_KEY } };

const readSettings = () =>
  JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}') as Record<string, unknown>;

const runSync = (projectKey = PROJECT_KEY, rootState: object = state) =>
  runSaga({ dispatch: () => {}, getState: () => rootState }, syncTmsUserSettings, projectKey).done;

describe('controllers/tmsUserSettings/sagas', () => {
  beforeEach(() => {
    localStorage.clear();
    fetchMock.mockReset();
  });

  test('puts the server settings of the project into local storage', async () => {
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({
        testCaseListPageSize: 20,
        milestonesPageSize: 20,
        lastPath: '/x',
        [TMS_USER_SETTINGS_MIGRATED_KEY]: MIGRATED,
      }),
    );
    fetchMock.mockResolvedValue({ settings: { testCaseListPageSize: 50 } });

    await runSync();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(URLS.tmsUserSettings(PROJECT_KEY));
    expect(readSettings()).toEqual({
      testCaseListPageSize: 50,
      lastPath: '/x',
      [TMS_USER_SETTINGS_MIGRATED_KEY]: MIGRATED,
    });
  });

  test('copies local values to the server once when the server has none', async () => {
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({ testCaseListPageSize: 50, lastPath: '/x' }),
    );
    fetchMock.mockResolvedValueOnce({ settings: {} }).mockResolvedValueOnce({});

    await runSync();

    expect(fetchMock).toHaveBeenNthCalledWith(2, URLS.tmsUserSettings(PROJECT_KEY), {
      method: 'put',
      data: { settings: { testCaseListPageSize: 50 } },
    });
    expect(readSettings()).toEqual({
      testCaseListPageSize: 50,
      lastPath: '/x',
      [TMS_USER_SETTINGS_MIGRATED_KEY]: MIGRATED,
    });
  });

  test('after the first copy, a project without server settings uses the defaults', async () => {
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({ testCaseListPageSize: 50, [TMS_USER_SETTINGS_MIGRATED_KEY]: MIGRATED }),
    );
    fetchMock.mockResolvedValue({ settings: {} });

    await runSync();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(readSettings()).toEqual({ [TMS_USER_SETTINGS_MIGRATED_KEY]: MIGRATED });
  });

  test('copies only the local values the server lacks before the first sync', async () => {
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({ testCaseListPageSize: 20, milestonesPageSize: 20 }),
    );
    fetchMock
      .mockResolvedValueOnce({ settings: { testCaseListPageSize: 50 } })
      .mockResolvedValueOnce({});

    await runSync();

    expect(fetchMock).toHaveBeenNthCalledWith(2, URLS.tmsUserSettings(PROJECT_KEY), {
      method: 'put',
      data: { settings: { milestonesPageSize: 20 } },
    });
    expect(readSettings()).toEqual({
      testCaseListPageSize: 50,
      milestonesPageSize: 20,
      [TMS_USER_SETTINGS_MIGRATED_KEY]: MIGRATED,
    });
  });

  test('keeps local storage when the server settings cannot be loaded', async () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ testCaseListPageSize: 50 }));
    fetchMock.mockRejectedValue(new Error('Not Found'));

    await runSync();

    expect(readSettings()).toEqual({ testCaseListPageSize: 50 });
  });

  test('ignores the response when another project became active meanwhile', async () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ testCaseListPageSize: 50 }));
    fetchMock.mockResolvedValue({ settings: { testCaseListPageSize: 100 } });

    await runSync(PROJECT_KEY, {
      user: { info: { userId: USER_ID }, activeProjectKey: 'project_b' },
    });

    expect(readSettings()).toEqual({ testCaseListPageSize: 50 });
  });

  test('updateTmsUserSettings sends the changed keys to the server', async () => {
    fetchMock.mockResolvedValue({});

    await runSaga(
      { dispatch: () => {}, getState: () => state },
      updateTmsUserSettings,
      updateTmsUserSettingsAction(PROJECT_KEY, { testCaseListPageSize: 100 }),
    ).done;

    expect(fetchMock).toHaveBeenCalledWith(URLS.tmsUserSettings(PROJECT_KEY), {
      method: 'put',
      data: { settings: { testCaseListPageSize: 100 } },
    });
  });
});
