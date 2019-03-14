import { FETCH_PROJECTS } from './constants';

export const fetchProjectsAction = (params) => ({
  type: FETCH_PROJECTS,
  payload: params,
});
