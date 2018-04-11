import {
  INITIAL_STATE,
  FETCH_DASHBOARD_SUCCESS,
  CHANGE_VISIBILITY_TYPE,
  ADD_DASHBOARD_ITEM_SUCCESS,
  DELETE_DASHBOARD_ITEM_SUCCESS,
  UPDATE_DASHBOARD_ITEM_SUCCESS,
} from './constants';

export const dashboardReducer = (state = INITIAL_STATE, { type, payload }) => {
  switch (type) {
    case FETCH_DASHBOARD_SUCCESS:
      return { ...state, ...{ dashboardItems: payload } };
    case CHANGE_VISIBILITY_TYPE:
      return { ...state, ...{ gridType: payload } };
    case ADD_DASHBOARD_ITEM_SUCCESS:
      return { ...state, ...{ dashboardItems: [...state.dashboardItems, payload] } };
    case DELETE_DASHBOARD_ITEM_SUCCESS:
      return {
        ...state,
        ...{ dashboardItems: state.dashboardItems.filter((item) => item.id !== payload) },
      };
    case UPDATE_DASHBOARD_ITEM_SUCCESS:
      return {
        ...state,
        ...{
          dashboardItems: state.dashboardItems.map((item) => {
            if (item.id === payload.id) {
              return payload;
            }
            return item;
          }),
        },
      };
    default:
      return state;
  }
};
