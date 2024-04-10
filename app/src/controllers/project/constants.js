/*
 * Copyright 2019 EPAM Systems
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

export const PROJECT_INFO_INITIAL_STATE = {};
export const PROJECT_PREFERENCES_INITIAL_STATE = {
  filters: [],
};
export const PROJECT_ATTRIBUTES_DELIMITER = '.';

export const FETCH_PROJECT = 'fetchProject';
export const FETCH_PROJECT_SUCCESS = 'fetchProjectSuccess';
export const FETCH_PROJECT_PREFERENCES = 'fetchProjectPreferences';
export const FETCH_PROJECT_PREFERENCES_SUCCESS = 'fetchProjectPreferencesSuccess';
export const FETCH_CONFIGURATION_ATTRIBUTES = 'fetchConfigurationAttributes';
export const UPDATE_CONFIGURATION_ATTRIBUTES = 'updateConfigurationAttributes';
export const UPDATE_DEFECT_TYPE = 'updateDefectType';
export const UPDATE_DEFECT_TYPE_SUCCESS = 'updateDefectTypeSuccess';
export const ADD_DEFECT_TYPE = 'addDefectType';
export const ADD_DEFECT_TYPE_SUCCESS = 'addDefectTypeSuccess';
export const DELETE_DEFECT_TYPE = 'deleteDefectType';
export const DELETE_DEFECT_TYPE_SUCCESS = 'deleteDefectTypeSuccess';
export const FETCH_EXISTING_LAUNCH_NAMES_SUCCESS = 'fetchExistingLaunchNamesSuccess';

export const ANALYZER_ATTRIBUTE_PREFIX = 'analyzer';
export const JOB_ATTRIBUTE_PREFIX = 'job';
export const PA_ATTRIBUTE_ENABLED_KEY = 'analyzer.isAutoPatternAnalyzerEnabled';
export const AA_ATTRIBUTE_ENABLED_KEY = 'analyzer.isAutoAnalyzerEnabled';

export const ADD_PATTERN = 'addPattern';
export const ADD_PATTERN_SUCCESS = 'addPatternSuccess';
export const UPDATE_PATTERN = 'updatePattern';
export const UPDATE_PATTERN_SUCCESS = 'updatePatternSuccess';
export const DELETE_PATTERN = 'deletePattern';
export const DELETE_PATTERN_SUCCESS = 'deletePatternSuccess';
export const UPDATE_PA_STATE = 'updatePAState';

export const ADD_PROJECT_NOTIFICATION = 'addProjectNotification';
export const ADD_PROJECT_NOTIFICATION_SUCCESS = 'addProjectNotificationSuccess';
export const FETCH_PROJECT_NOTIFICATIONS = 'fetchProjectNotification';
export const FETCH_PROJECT_NOTIFICATIONS_SUCCESS = 'fetchProjectNotificationSuccess';
export const UPDATE_NOTIFICATION_STATE = 'updateNotificationState';
export const NOTIFICATIONS_ATTRIBUTE_ENABLED_KEY = 'notifications.enabled';
export const UPDATE_PROJECT_NOTIFICATION = 'updateProjectNotification';
export const UPDATE_PROJECT_NOTIFICATION_SUCCESS = 'updateProjectNotificationSuccess';
export const DELETE_PROJECT_NOTIFICATION = 'deleteProjectNotification';
export const DELETE_PROJECT_NOTIFICATION_SUCCESS = 'deleteProjectNotificationSuccess';
export const SET_PROJECT_NOTIFICATION_LOADING = 'setProjectNotificationLoading';

export const NAMESPACE = 'project';

export const HIDE_FILTER_ON_LAUNCHES = 'hideFilterOnLaunches';
export const SHOW_FILTER_ON_LAUNCHES = 'showFilterOnLaunches';
export const UPDATE_PROJECT_FILTER_PREFERENCES = 'updateProjectFilterPreferences';
