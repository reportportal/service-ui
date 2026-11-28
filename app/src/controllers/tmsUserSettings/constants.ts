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

import { TEST_CASE_LIST_NAMESPACE } from 'pages/inside/common/testCaseList/constants';
import { HISTORY_OF_ACTIONS_NAMESPACE } from 'pages/inside/testCaseLibraryPage/historyOfActions/constants';
import { MILESTONES_NAMESPACE } from 'controllers/milestone/constants';
import { TEST_PLAN_TEST_CASES_NAMESPACE } from 'controllers/testPlan/constants';
import {
  MANUAL_LAUNCHES_NAMESPACE,
  MANUAL_LAUNCH_TEST_CASE_EXECUTIONS_NAMESPACE,
} from 'controllers/manualLaunch/constants';

export const UPDATE_TMS_USER_SETTINGS = 'updateTmsUserSettings' as const;

/**
 * Local storage entry (in the user settings): the keys and key prefixes of TMS list settings whose
 * local values this browser already copied to the server, so they are not copied again.
 */
export const TMS_USER_SETTINGS_MIGRATED_KEY = 'tmsUserSettingsMigrated';

const getPageSizeKey = (namespace: string) => `${namespace}PageSize`;

/**
 * Keys of the user settings in local storage that are TMS list settings and are stored on the
 * server per user and per project. Local storage keeps a copy for the current project.
 * A new list setting is stored on the server once its key is listed here and it is saved with
 * updateTmsUserSettingsAction.
 */
export const TMS_USER_SETTINGS_KEYS: readonly string[] = [
  TEST_CASE_LIST_NAMESPACE,
  HISTORY_OF_ACTIONS_NAMESPACE,
  MILESTONES_NAMESPACE,
  TEST_PLAN_TEST_CASES_NAMESPACE,
  MANUAL_LAUNCHES_NAMESPACE,
  MANUAL_LAUNCH_TEST_CASE_EXECUTIONS_NAMESPACE,
].map(getPageSizeKey);

/**
 * Key prefixes of TMS list settings with a variable part (for example a setting per launch),
 * stored on the server like TMS_USER_SETTINGS_KEYS.
 */
export const TMS_USER_SETTINGS_KEY_PREFIXES: readonly string[] = [];
