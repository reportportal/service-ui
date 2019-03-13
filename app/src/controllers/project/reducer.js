import { combineReducers } from 'redux';
import { ADD_FILTER, REMOVE_FILTER, UPDATE_FILTER_SUCCESS, updateFilter } from 'controllers/filter';
import { updateIntegrations } from './utils';
import {
  PROJECT_INFO_INITIAL_STATE,
  PROJECT_PREFERENCES_INITIAL_STATE,
  FETCH_PROJECT_SUCCESS,
  FETCH_PROJECT_PREFERENCES_SUCCESS,
  UPDATE_CONFIGURATION_ATTRIBUTES,
  UPDATE_NOTIFICATIONS_CONFIG_SUCCESS,
  UPDATE_PROJECT_INTEGRATIONS,
} from './constants';

export const projectInfoReducer = (
  state = PROJECT_INFO_INITIAL_STATE,
  { type, payload, meta = {} },
) => {
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
    case UPDATE_PROJECT_INTEGRATIONS:
      return {
        ...state,
        integrations: meta.reset ? payload : updateIntegrations(state.integrations, payload),
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
