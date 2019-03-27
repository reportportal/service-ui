import { PAGE_KEY, SIZE_KEY } from 'controllers/pagination';

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
