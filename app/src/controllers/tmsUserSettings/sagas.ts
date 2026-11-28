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

import { all, call, select, takeEvery } from 'redux-saga/effects';
import { isEmpty } from 'es-toolkit/compat';

import { URLS } from 'common/urls';
import { fetch } from 'common/utils/fetch';
import { activeProjectKeySelector, userIdSelector } from 'controllers/user/selectors';

import { UPDATE_TMS_USER_SETTINGS } from './constants';
import type { TmsUserSettingsRS, UpdateTmsUserSettingsAction } from './types';
import { applyTmsUserSettingsToStorage, getTmsUserSettingsToMigrate } from './utils';

/**
 * Loads the TMS list settings of the current user in the project and puts them into local
 * storage, where the lists read them. Local values that this browser never copied to the server
 * and that the server does not have yet are copied once (existing values from before the
 * server storage, or a setting that is stored on the server since a later release).
 * Never fails: without the server settings (older API, network error) the lists keep using
 * local storage.
 */
export function* syncTmsUserSettings(projectKey: string): Generator {
  try {
    const userId = (yield select(userIdSelector)) as string | number | undefined;

    if (!userId || !projectKey) {
      return;
    }

    const response = (yield call(fetch, URLS.tmsUserSettings(projectKey))) as TmsUserSettingsRS;
    const activeProjectKey = (yield select(activeProjectKeySelector)) as string | undefined;

    if (activeProjectKey && activeProjectKey !== projectKey) {
      return;
    }

    const serverSettings = response?.settings ?? {};
    const settingsToMigrate = getTmsUserSettingsToMigrate(userId, serverSettings);

    if (!isEmpty(settingsToMigrate)) {
      yield call(fetch, URLS.tmsUserSettings(projectKey), {
        method: 'put',
        data: { settings: settingsToMigrate },
      });
    }

    applyTmsUserSettingsToStorage(userId, { ...serverSettings, ...settingsToMigrate });
  } catch {
    // Server settings are optional: local storage stays the source.
  }
}

export function* updateTmsUserSettings({ payload }: UpdateTmsUserSettingsAction): Generator {
  try {
    yield call(fetch, URLS.tmsUserSettings(payload.projectKey), {
      method: 'put',
      data: { settings: payload.settings },
    });
  } catch {
    // The value is already in local storage; it reaches the server with the next change.
  }
}

function* watchUpdateTmsUserSettings() {
  yield takeEvery(UPDATE_TMS_USER_SETTINGS, updateTmsUserSettings);
}

export function* tmsUserSettingsSagas() {
  yield all([watchUpdateTmsUserSettings()]);
}
