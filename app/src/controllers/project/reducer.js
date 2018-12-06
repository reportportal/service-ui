import { combineReducers } from 'redux';
import { ADD_FILTER, REMOVE_FILTER, UPDATE_FILTER_SUCCESS, updateFilter } from 'controllers/filter';
import {
  PROJECT_INFO_INITIAL_STATE,
  PROJECT_PREFERENCES_INITIAL_STATE,
  FETCH_PROJECT_SUCCESS,
  FETCH_PROJECT_PREFERENCES_SUCCESS,
  UPDATE_CONFIGURATION_ATTRIBUTES,
  UPDATE_NOTIFICATIONS_CONFIG_SUCCESS,
  EMAIL_NOTIFICATION_INTEGRATION_TYPE,
} from './constants';

const getUpdatedIntegrations = (integrations = [], { enabled, rules }) => {
  const emailIndex = integrations.findIndex(
    (integration) => integration.integrationType.groupType === EMAIL_NOTIFICATION_INTEGRATION_TYPE,
  );
  if (emailIndex === -1) {
    return integrations;
  }
  const updatedNotificationsIntegration = {
    ...integrations[emailIndex],
    enabled,
    integrationParameters: {
      rules,
    },
  };

  const updatedIntegrations = [...integrations];
  updatedIntegrations.splice(emailIndex, 1, updatedNotificationsIntegration);
  return updatedIntegrations;
};

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
    case UPDATE_NOTIFICATIONS_CONFIG_SUCCESS: {
      return {
        ...state,
        integrations: getUpdatedIntegrations(state.integrations, payload),
      };
    }
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
