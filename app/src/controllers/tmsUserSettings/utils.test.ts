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

import {
  TMS_USER_SETTINGS_KEYS,
  TMS_USER_SETTINGS_KEY_PREFIXES,
  TMS_USER_SETTINGS_MIGRATED_KEY,
} from './constants';
import {
  applyTmsUserSettingsToStorage,
  getTmsUserSettingEntry,
  getTmsUserSettingsToMigrate,
  isTmsUserSettingKey,
} from './utils';

jest.mock('./constants', () => ({
  ...jest.requireActual<Record<string, unknown>>('./constants'),
  TMS_USER_SETTINGS_KEY_PREFIXES: ['manualLaunchFolderTreeViewMode_'],
}));

const USER_ID = 7;
const SETTINGS_KEY = `${USER_ID}_settings`;
const ALL_ENTRIES = [...TMS_USER_SETTINGS_KEYS, ...TMS_USER_SETTINGS_KEY_PREFIXES];

const readSettings = () =>
  JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}') as Record<string, unknown>;
const writeSettings = (settings: Record<string, unknown>) =>
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

describe('controllers/tmsUserSettings/utils', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('isTmsUserSettingKey accepts listed keys and keys with a listed prefix only', () => {
    expect(isTmsUserSettingKey('testCaseListPageSize')).toBe(true);
    expect(isTmsUserSettingKey('manualLaunchesPageSize')).toBe(true);
    expect(isTmsUserSettingKey('manualLaunchFolderTreeViewMode_12')).toBe(true);
    expect(getTmsUserSettingEntry('manualLaunchFolderTreeViewMode_12')).toBe(
      'manualLaunchFolderTreeViewMode_',
    );
    expect(isTmsUserSettingKey('launchesPageSize')).toBe(false);
    expect(isTmsUserSettingKey('lastPath')).toBe(false);
  });

  test('before the first sync, every local TMS setting the server lacks is copied', () => {
    writeSettings({ testCaseListPageSize: 50, milestonesPageSize: 20, lastPath: '/x' });

    expect(getTmsUserSettingsToMigrate(USER_ID, { milestonesPageSize: 100 })).toEqual({
      testCaseListPageSize: 50,
    });
  });

  test('after the first sync, nothing is copied again', () => {
    writeSettings({ testCaseListPageSize: 50, [TMS_USER_SETTINGS_MIGRATED_KEY]: ALL_ENTRIES });

    expect(getTmsUserSettingsToMigrate(USER_ID, {})).toEqual({});
  });

  test('a setting listed later is copied once although other settings were copied before', () => {
    writeSettings({
      testCaseListPageSize: 50,
      manualLaunchFolderTreeViewMode_12: 'flat',
      [TMS_USER_SETTINGS_MIGRATED_KEY]: TMS_USER_SETTINGS_KEYS,
    });

    expect(getTmsUserSettingsToMigrate(USER_ID, {})).toEqual({
      manualLaunchFolderTreeViewMode_12: 'flat',
    });
  });

  test('applyTmsUserSettingsToStorage replaces TMS keys, keeps other settings, marks entries', () => {
    writeSettings({ testCaseListPageSize: 50, milestonesPageSize: 20, lastPath: '/x' });

    applyTmsUserSettingsToStorage(USER_ID, { testCaseListPageSize: 100, unknownKey: 1 });

    expect(readSettings()).toEqual({
      testCaseListPageSize: 100,
      lastPath: '/x',
      [TMS_USER_SETTINGS_MIGRATED_KEY]: ALL_ENTRIES,
    });
  });
});
