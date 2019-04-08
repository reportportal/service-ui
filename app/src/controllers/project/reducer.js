import { combineReducers } from 'redux';
import { ADD_FILTER, REMOVE_FILTER, UPDATE_FILTER_SUCCESS, updateFilter } from 'controllers/filter';
import {
  PROJECT_INFO_INITIAL_STATE,
  PROJECT_PREFERENCES_INITIAL_STATE,
  FETCH_PROJECT_SUCCESS,
  FETCH_PROJECT_PREFERENCES_SUCCESS,
  UPDATE_CONFIGURATION_ATTRIBUTES,
  UPDATE_NOTIFICATIONS_CONFIG_SUCCESS,
  UPDATE_DEFECT_SUBTYPE_SUCCESS,
  ADD_DEFECT_SUBTYPE_SUCCESS,
} from './constants';

export const projectInfoReducer = (state = PROJECT_INFO_INITIAL_STATE, { type, payload }) => {
  switch (type) {
    case FETCH_PROJECT_SUCCESS:
      return { ...state, ...payload };
    case UPDATE_CONFIGURATION_ATTRIBUTES:
      return {
        ...state,
        configuration: {
          ...state.configuration,
          attributes: {
            ...((state.configuration && state.configuration.attributes) || {}),
            ...payload,
          },
        },
      };
    case UPDATE_NOTIFICATIONS_CONFIG_SUCCESS:
      return {
        ...state,
        configuration: {
          ...state.configuration,
          notificationsConfiguration: payload,
        },
      };
    case UPDATE_DEFECT_SUBTYPE_SUCCESS:
      return {
        ...state,
        configuration: {
          ...state.configuration,
          subTypes: {
            ...state.configuration.subTypes,
            [payload.typeRef]: state.configuration.subTypes[payload.typeRef].map(
              (subType) => (subType.id === payload.id ? payload : subType),
            ),
          },
        },
      };
    case ADD_DEFECT_SUBTYPE_SUCCESS:
      return {
        ...state,
        configuration: {
          ...state.configuration,
          subTypes: {
            ...state.configuration.subTypes,
            [payload.typeRef]: [...state.configuration.subTypes[payload.typeRef], payload],
          },
        },
      };
    default:
      return state;
  }
};

export const projectPreferencesReducer = (
  state = PROJECT_PREFERENCES_INITIAL_STATE,
  { type, payload, meta: { oldId } = {} },
) => {
  switch (type) {
    case FETCH_PROJECT_PREFERENCES_SUCCESS:
      return { ...state, ...payload };
    case UPDATE_FILTER_SUCCESS:
      return { ...state, filters: updateFilter(state.filters, payload, oldId) };
    case ADD_FILTER:
      return { ...state, filters: [...state.filters, payload] };
    case REMOVE_FILTER:
      return { ...state, filters: state.filters.filter((filter) => filter.id !== payload) };
    default:
      return state;
  }
};

export const projectReducer = combineReducers({
  info: projectInfoReducer,
  preferences: projectPreferencesReducer,
});
