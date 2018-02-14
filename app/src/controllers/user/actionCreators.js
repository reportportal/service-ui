import { fetch } from 'common/utils';
import { FETCH_USER_SUCCESS } from './constants';

const fetchUserSuccessAction = user => ({
  type: FETCH_USER_SUCCESS,
  payload: user,
});
export const fetchUserAction = () => dispatch =>
  fetch('/api/v1/user')
    .then(user => dispatch(fetchUserSuccessAction(user)));

