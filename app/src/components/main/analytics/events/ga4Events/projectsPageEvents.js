/*
 * Copyright 2025 EPAM Systems
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

import { getBasicChooseEventParameters, getBasicClickEventParameters } from '../common/ga4Utils';

const PROJECTS_PAGE = 'project_page';

const BASIC_EVENT_PARAMETERS = getBasicClickEventParameters(PROJECTS_PAGE);

export const PROJECTS_PAGE_EVENTS = {
  clickOpenCreateProjectModal: (place) => ({
    ...BASIC_EVENT_PARAMETERS,
    element_name: 'create_project',
    place,
  }),
  clickCreateProjectModalSubmit: () => ({
    ...BASIC_EVENT_PARAMETERS,
    modal: 'create_project',
    element_name: 'create_project',
  }),
  projectPageMenuOptionClick: (elementName, projectId) => ({
    ...BASIC_EVENT_PARAMETERS,
    place: 'project_page',
    element_name: elementName,
    project_id: projectId,
  }),
  projectPageModalSubmitSuccess: (elementName, modal, projectId) => ({
    ...BASIC_EVENT_PARAMETERS,
    place: 'project_page',
    element_name: elementName,
    modal,
    project_id: projectId,
  }),
  projectsSortingArrowClick: () => ({
    ...BASIC_EVENT_PARAMETERS,
    place: 'project_page',
    element_name: 'projects_sorting_arrow',
  }),
  clickRenameProjectModalSubmit: (projectId) => ({
    ...BASIC_EVENT_PARAMETERS,
    modal: 'rename_project',
    element_name: 'rename',
    project_id: projectId,
  }),
  clickDeleteProjectModalSubmit: (projectId) => ({
    ...BASIC_EVENT_PARAMETERS,
    modal: 'delete_project',
    element_name: 'delete_project',
    project_id: projectId,
  }),
  SEARCH_PROJECTS_FIELD: {
    ...BASIC_EVENT_PARAMETERS,
    place: 'projects',
    element_name: 'search',
  },
  clickApplyFilterButton: (type, condition) => ({
    ...BASIC_EVENT_PARAMETERS,
    modal: 'filter_project_page',
    element_name: 'apply',
    condition,
    type,
  }),
  changePageSize: (pageSize) => ({
    ...getBasicChooseEventParameters(PROJECTS_PAGE),
    element_name: 'page_size_control',
    number: pageSize,
    place: 'project_page',
  }),
  assignSelfToProject: () => ({
    ...BASIC_EVENT_PARAMETERS,
    place: 'project_page',
    element_name: 'assign',
  }),
  unassignSelfToProject: () => ({
    ...BASIC_EVENT_PARAMETERS,
    place: 'project_page',
    element_name: 'unassign',
    modal: 'unassign_from_project'
  }),
};
