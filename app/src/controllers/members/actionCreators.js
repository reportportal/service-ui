import { FETCH_MEMBERS } from './constants';

export const fetchMembersAction = (params) => ({
  type: FETCH_MEMBERS,
  payload: params,
});
