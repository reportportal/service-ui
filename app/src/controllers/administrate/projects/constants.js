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
export const DELETE_PROJECT = 'deleteProject';
export const DEFAULT_SORT_COLUMN = 'name';
export const DEFAULT_SORTING = formatSortingString([DEFAULT_SORT_COLUMN], SORTING_ASC);
export const REDIRECT_TO_PROJECT = 'redirectToProject';
export const CONFIRM_ASSIGN_TO_PROJECT = 'confirmAssignToProject';
