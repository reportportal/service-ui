/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
  DELETE_DEFECT_SUBTYPE_SUCCESS,
  ADD_PATTERN_SUCCESS,
  UPDATE_PATTERN_SUCCESS,
  DELETE_PATTERN_SUCCESS,
  FETCH_PROJECT,
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
          subTypes: Object.keys(state.configuration.subTypes).reduce(
            (result, typeRef) => ({
              ...result,
              [typeRef]: state.configuration.subTypes[typeRef].map((subType) => {
                const newSubType = payload.find(({ id }) => id === subType.id);
                return newSubType || subType;
              }),
            }),
            {},
          ),
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
    case DELETE_DEFECT_SUBTYPE_SUCCESS:
      return {
        ...state,
        configuration: {
          ...state.configuration,
          subTypes: {
            ...state.configuration.subTypes,
            [payload.typeRef]: state.configuration.subTypes[payload.typeRef].filter(
              (subType) => subType.id !== payload.id,
            ),
          },
        },
      };
    case ADD_PATTERN_SUCCESS:
      return {
        ...state,
        configuration: {
          ...state.configuration,
          patterns: [...state.configuration.patterns, payload],
        },
      };
    case UPDATE_PATTERN_SUCCESS:
      return {
        ...state,
        configuration: {
          ...state.configuration,
          patterns: state.configuration.patterns.map((pattern) => {
            if (pattern.id === payload.id) return payload;
            return pattern;
          }),
        },
      };
    case DELETE_PATTERN_SUCCESS:
      return {
        ...state,
        configuration: {
          ...state.configuration,
          patterns: state.configuration.patterns.filter((pattern) => pattern.id !== payload.id),
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

export const projectInfoLoadingReducer = (state = false, { type }) => {
  switch (type) {
    case FETCH_PROJECT:
      return true;
    case FETCH_PROJECT_SUCCESS:
      return false;
    default:
      return state;
  }
};

export const projectReducer = combineReducers({
  info: projectInfoReducer,
  preferences: projectPreferencesReducer,
  infoLoading: projectInfoLoadingReducer,
});
