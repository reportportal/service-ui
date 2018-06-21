import { FETCH_START, FETCH_SUCCESS } from 'controllers/fetch/constants';
import { NAMESPACE as LAUNCH_NAMESPACE } from 'controllers/launch/constants';
import { NAMESPACE as FILTER_NAMESPACE } from 'controllers/filter/constants';
import { NAMESPACE as MEMBERS_NAMESPACE } from 'controllers/members/constants';

export const loadingReducer = (state = false, { type, meta }) => {
  if (
    meta &&
    meta.namespace &&
    meta.namespace !== LAUNCH_NAMESPACE &&
    meta.namespace !== FILTER_NAMESPACE &&
    meta.namespace !== MEMBERS_NAMESPACE
  ) {
    return state;
  }
  switch (type) {
    case FETCH_START:
      return true;
    case FETCH_SUCCESS:
      return false;
    default:
      return state;
  }
};
