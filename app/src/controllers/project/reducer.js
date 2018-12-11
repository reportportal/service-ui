import { combineReducers } from 'redux';
import {
  PROJECT_INFO_INITIAL_STATE,
  PROJECT_PREFERENCES_INITIAL_STATE,
  FETCH_PROJECT_SUCCESS,
  FETCH_PROJECT_PREFERENCES_SUCCESS,
  TOGGLE_DISPLAY_FILTER_ON_LAUNCHES,
  UPDATE_CONFIGURATION_ATTRIBUTES,
  UPDATE_NOTIFICATIONS_CONFIG_SUCCESS,
  EMAIL_NOTIFICATION_INTEGRATION_TYPE,
} from './constants';

const toggleFilter = (filters = [], filter) => {
  const index = filters.indexOf(filter);
  if (index !== -1) {
    return filters.filter((item) => item !== filter);
  }
  return [...filters, filter];
};

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
  { type, payload },
) => {
  switch (type) {
    case FETCH_PROJECT_PREFERENCES_SUCCESS:
      return { ...state, ...payload };
    case TOGGLE_DISPLAY_FILTER_ON_LAUNCHES:
      return { ...state, filters: toggleFilter(state.filters, payload) };
    default:
      return state;
  }
};

export const projectReducer = combineReducers({
  info: projectInfoReducer,
  preferences: projectPreferencesReducer,
});
