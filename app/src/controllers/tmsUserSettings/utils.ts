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

import { getStorageItem, setStorageItem } from 'common/utils/storageUtils';

import {
  TMS_USER_SETTINGS_KEYS,
  TMS_USER_SETTINGS_KEY_PREFIXES,
  TMS_USER_SETTINGS_MIGRATED_KEY,
} from './constants';
import type { TmsUserSettings } from './types';

const getUserSettingsKey = (userId: string | number) => `${userId}_settings`;

const getLocalUserSettings = (userId: string | number): TmsUserSettings =>
  (getStorageItem(getUserSettingsKey(userId)) as TmsUserSettings | null) ?? {};

const pickTmsSettings = (settings: TmsUserSettings): TmsUserSettings =>
  Object.fromEntries(Object.entries(settings).filter(([key]) => isTmsUserSettingKey(key)));

/** The listed key or key prefix a TMS list setting belongs to, or undefined for other settings. */
export const getTmsUserSettingEntry = (key: string): string | undefined =>
  TMS_USER_SETTINGS_KEYS.includes(key)
    ? key
    : TMS_USER_SETTINGS_KEY_PREFIXES.find((prefix) => key.startsWith(prefix));

export const isTmsUserSettingKey = (key: string): boolean => Boolean(getTmsUserSettingEntry(key));

const getMigratedEntries = (settings: TmsUserSettings): string[] => {
  const value = settings[TMS_USER_SETTINGS_MIGRATED_KEY];

  return Array.isArray(value) ? (value as string[]) : [];
};

/**
 * Local TMS list settings that were never copied to the server from this browser and that the
 * server does not have for the project yet. A setting listed later (a new key in
 * TMS_USER_SETTINGS_KEYS) is copied on the next load, too.
 */
export const getTmsUserSettingsToMigrate = (
  userId: string | number,
  serverSettings: TmsUserSettings,
): TmsUserSettings => {
  const settings = getLocalUserSettings(userId);
  const migratedEntries = getMigratedEntries(settings);

  return Object.fromEntries(
    Object.entries(pickTmsSettings(settings)).filter(
      ([key]) => !(key in serverSettings) && !migratedEntries.includes(getTmsUserSettingEntry(key)),
    ),
  );
};

/**
 * Replaces the TMS list settings in local storage with the settings of the project from the
 * server: keys from the server are written, other TMS keys are removed, so the values of another
 * project do not apply. Other user settings stay as they are. All listed keys and prefixes are
 * marked as copied to the server.
 */
export const applyTmsUserSettingsToStorage = (
  userId: string | number,
  serverSettings: TmsUserSettings,
): void => {
  const settings = getLocalUserSettings(userId);
  const otherSettings = Object.fromEntries(
    Object.entries(settings).filter(([key]) => !isTmsUserSettingKey(key)),
  );

  setStorageItem(getUserSettingsKey(userId), {
    ...otherSettings,
    ...pickTmsSettings(serverSettings),
    [TMS_USER_SETTINGS_MIGRATED_KEY]: [
      ...TMS_USER_SETTINGS_KEYS,
      ...TMS_USER_SETTINGS_KEY_PREFIXES,
    ],
  });
};
