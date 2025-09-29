/*
 * Copyright 2024 EPAM Systems
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

export const PROJECTS_NAMESPACE = 'projects';

export const PREPARE_ACTIVE_ORGANIZATION_PROJECTS = 'prepareActiveOrganizationProjects';

export const FETCH_ORGANIZATION_BY_SLUG = 'fetchOrganizationBySlug';

export const SET_ACTIVE_ORGANIZATION = 'setActiveOrganization';

export const FETCH_ORGANIZATION_SETTINGS = 'fetchOrganizationSettings';

export const PREPARE_ACTIVE_ORGANIZATION_SETTINGS = 'prepareActiveOrganizationSettings';

export const UPDATE_ORGANIZATION_SETTINGS = 'updateOrganizationSettings';
export const UPDATE_ORGANIZATION_SETTINGS_SUCCESS = 'updateOrganizationSettingsSuccess';

export const CREATE_ORGANIZATION = 'createOrganization';
export const RENAME_ORGANIZATION = 'renameOrganization';

export const ERROR_CODES = {
  ORGANIZATION_EXISTS: [4091, 4095, 40016],
};
