import { PAGE_KEY, SIZE_KEY } from 'controllers/pagination';

export const FETCH_PROJECTS = 'fetchProjects';
export const NAMESPACE = 'projects';
export const DEFAULT_PAGE_SIZE = 50;
export const DEFAULT_PAGINATION = {
  [PAGE_KEY]: 1,
  [SIZE_KEY]: DEFAULT_PAGE_SIZE,
};
