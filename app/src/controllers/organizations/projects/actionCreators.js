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

import { PROJECT_DETAILS_PAGE } from 'controllers/pages';
import { CREATE_PROJECT, FETCH_ORGANIZATION_PROJECTS, NAVIGATE_TO_PROJECT } from './constants';

export const fetchOrganizationProjectsAction = (params) => {
  return {
    type: FETCH_ORGANIZATION_PROJECTS,
    payload: params,
  };
};

export const createProjectAction = (project) => ({
  type: CREATE_PROJECT,
  payload: project,
});

export const navigateToProjectAction = (project) => ({
  type: NAVIGATE_TO_PROJECT,
  payload: project,
});

export const navigateToProjectSectionAction = ({ organizationSlug, projectSlug }, section) => ({
  type: PROJECT_DETAILS_PAGE,
  payload: {
    projectSlug,
    projectSection: section,
    organizationSlug,
  },
});
