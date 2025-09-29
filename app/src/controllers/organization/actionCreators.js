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

import {
  FETCH_ORGANIZATION_BY_SLUG,
  PREPARE_ACTIVE_ORGANIZATION_PROJECTS,
  PREPARE_ACTIVE_ORGANIZATION_SETTINGS,
  SET_ACTIVE_ORGANIZATION,
  UPDATE_ORGANIZATION_SETTINGS,
  UPDATE_ORGANIZATION_SETTINGS_SUCCESS,
  CREATE_ORGANIZATION,
  RENAME_ORGANIZATION,
} from './constants';

export const prepareActiveOrganizationProjectsAction = (payload) => ({
  type: PREPARE_ACTIVE_ORGANIZATION_PROJECTS,
  payload,
});

export const fetchOrganizationBySlugAction = (payload) => ({
  type: FETCH_ORGANIZATION_BY_SLUG,
  payload,
});

export const setActiveOrganizationAction = (payload) => ({
  type: SET_ACTIVE_ORGANIZATION,
  payload,
});

export const prepareActiveOrganizationSettingsAction = (payload) => ({
  type: PREPARE_ACTIVE_ORGANIZATION_SETTINGS,
  payload,
});

export const updateOrganizationSettingsAction = (payload) => ({
  type: UPDATE_ORGANIZATION_SETTINGS,
  payload,
});

export const updateOrganizationSettingsSuccessAction = (payload) => ({
  type: UPDATE_ORGANIZATION_SETTINGS_SUCCESS,
  payload,
});

export const createOrganizationAction = (payload) => ({
  type: CREATE_ORGANIZATION,
  payload,
});

export const renameOrganizationAction = (organizationId, newOrganizationName, onSuccess) => ({
  type: RENAME_ORGANIZATION,
  payload: { organizationId, newOrganizationName, onSuccess },
});
