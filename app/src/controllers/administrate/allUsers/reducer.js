import { combineReducers } from 'redux';
import { fetchReducer } from 'controllers/fetch';
import { paginationReducer } from 'controllers/pagination';
import { loadingReducer } from 'controllers/loading';
import { groupOperationsReducer } from 'controllers/groupOperations';
import { queueReducers } from 'common/utils/queueReducers';
import { NAMESPACE, TOGGLE_USER_ROLE_FORM } from './constants';

const toggleUserRoleFormReducer = (state, { type, payload = {} }) => {
  switch (type) {
    case TOGGLE_USER_ROLE_FORM:
      return state.map((item) => {
        if (item.userId === payload.userId) {
          return { ...item, expandRoleSelection: payload.value };
        }
        return { ...item, expandRoleSelection: false };
      });
    default:
      return state;
  }
};

export const allUsersReducer = combineReducers({
  allUsers: queueReducers(
    fetchReducer(NAMESPACE, { contentPath: 'content' }),
    toggleUserRoleFormReducer,
  ),
  pagination: paginationReducer(NAMESPACE),
  loading: loadingReducer(NAMESPACE),
  groupOperations: groupOperationsReducer(NAMESPACE),
});
