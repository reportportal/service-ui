import { fetch } from 'common/utils';
import { FETCH_PROJECT_SUCCESS } from './constants';

const fetchProjectSuccessAction = project => ({
  type: FETCH_PROJECT_SUCCESS,
  payload: project,
});

export const fetchProjectAction = projectId => dispatch =>
  fetch(`/api/v1/project/${projectId}`)
    .then((project) => {
      dispatch(fetchProjectSuccessAction(project));
    });

