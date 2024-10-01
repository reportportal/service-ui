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

import { PAGE_KEY, SIZE_KEY } from 'controllers/pagination';
import { formatSortingString, SORTING_ASC } from 'controllers/sorting';

export const FETCH_PROJECTS = 'fetchProjects';
export const NAMESPACE = 'projects';
export const DEFAULT_PAGE_SIZE = 12;
export const DEFAULT_PAGINATION = {
  [PAGE_KEY]: 1,
  [SIZE_KEY]: DEFAULT_PAGE_SIZE,
};
export const TABLE_VIEW = 'table';
export const GRID_VIEW = 'grid';
export const USER_VIEW = 'projects_view_mode';
export const SET_PROJECTS_VIEW_MODE = 'setProjectsViewMode';
export const START_SET_VIEW_MODE = 'startSetProjectsViewMode';
export const ADD_PROJECT = 'addProject';
export const DELETE_PROJECT = 'deleteProject';
export const DEFAULT_SORT_COLUMN = 'name';
export const DEFAULT_SORTING = formatSortingString([DEFAULT_SORT_COLUMN], SORTING_ASC);
export const NAVIGATE_TO_PROJECT = 'navigateToProject';
export const CONFIRM_ASSIGN_TO_PROJECT = 'confirmAssignToProject';
export const ERROR_CODES = {
  PROJECT_EXISTS: 4095,
};
