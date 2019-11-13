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

import { UPDATE_FILTER_SUCCESS, ADD_FILTER, REMOVE_FILTER } from 'controllers/filter';
import { projectInfoReducer, projectPreferencesReducer } from './reducer';
import {
  PROJECT_INFO_INITIAL_STATE,
  PROJECT_PREFERENCES_INITIAL_STATE,
  FETCH_PROJECT_SUCCESS,
  UPDATE_CONFIGURATION_ATTRIBUTES,
  FETCH_PROJECT_PREFERENCES_SUCCESS,
  UPDATE_NOTIFICATIONS_CONFIG_SUCCESS,
  UPDATE_DEFECT_SUBTYPE_SUCCESS,
  ADD_DEFECT_SUBTYPE_SUCCESS,
  DELETE_DEFECT_SUBTYPE_SUCCESS,
  ADD_PATTERN_SUCCESS,
  UPDATE_PATTERN_SUCCESS,
  DELETE_PATTERN_SUCCESS,
} from './constants';

describe('project reducer', () => {
  describe('projectInfoReducer', () => {
    test('should return initial state', () => {
      expect(projectInfoReducer(undefined, {})).toBe(PROJECT_INFO_INITIAL_STATE);
    });

    test('should return old state on unknown action', () => {
      const oldState = { foo: 1 };
      expect(projectInfoReducer(oldState, { type: 'foo' })).toBe(oldState);
    });

    test('should handle FETCH_PROJECT_SUCCESS', () => {
      const payload = { foo: 'bar' };
      const newState = projectInfoReducer(PROJECT_INFO_INITIAL_STATE, {
        type: FETCH_PROJECT_SUCCESS,
        payload,
      });
      expect(newState).toEqual(payload);
    });

    test('should handle UPDATE_CONFIGURATION_ATTRIBUTES', () => {
      const oldState = {
        ...PROJECT_INFO_INITIAL_STATE,
        configuration: {
          ...PROJECT_INFO_INITIAL_STATE.configuration,
          attributes: {},
        },
      };
      const payload = { foo: 'bar' };
      const newState = projectInfoReducer(PROJECT_INFO_INITIAL_STATE, {
        type: UPDATE_CONFIGURATION_ATTRIBUTES,
        payload,
      });
      expect(newState).toEqual({
        ...oldState,
        configuration: {
          ...oldState.configuration,
          attributes: {
            ...oldState.configuration.attributes,
            ...payload,
          },
        },
      });
    });

    test('should handle UPDATE_EMAIL_CONFIG_SUCCESS', () => {
      const payload = { foo: 'bar' };
      const newState = projectInfoReducer(PROJECT_INFO_INITIAL_STATE, {
        type: UPDATE_NOTIFICATIONS_CONFIG_SUCCESS,
        payload,
      });
      expect(newState).toEqual({
        ...PROJECT_INFO_INITIAL_STATE,
        configuration: {
          ...PROJECT_INFO_INITIAL_STATE.configuration,
          notificationsConfiguration: payload,
        },
      });
    });

    test('should handle UPDATE_DEFECT_SUBTYPE_SUCCESS', () => {
      const payload = [
        {
          id: 1,
          typeRef: 'PRODUCT_BUG',
          longName: 'Product Bug',
          shortName: 'PB1',
          color: '#ffffff',
        },
      ];
      const state = { configuration: { subTypes: { PRODUCT_BUG: [{ id: 1 }, { id: 2 }] } } };
      const newState = projectInfoReducer(state, {
        type: UPDATE_DEFECT_SUBTYPE_SUCCESS,
        payload,
      });
      expect(newState).toEqual({
        configuration: {
          subTypes: {
            PRODUCT_BUG: [
              {
                id: 1,
                typeRef: 'PRODUCT_BUG',
                longName: 'Product Bug',
                shortName: 'PB1',
                color: '#ffffff',
              },
              { id: 2 },
            ],
          },
        },
      });
    });

    test('should handle ADD_DEFECT_SUBTYPE_SUCCESS', () => {
      const payload = {
        id: 3,
        typeRef: 'PRODUCT_BUG',
        longName: 'Product Bug',
        shortName: 'PB1',
        color: '#ffffff',
      };
      const state = { configuration: { subTypes: { PRODUCT_BUG: [{ id: 1 }, { id: 2 }] } } };
      const newState = projectInfoReducer(state, {
        type: ADD_DEFECT_SUBTYPE_SUCCESS,
        payload,
      });
      expect(newState).toEqual({
        configuration: {
          subTypes: {
            PRODUCT_BUG: [
              { id: 1 },
              { id: 2 },
              {
                id: 3,
                typeRef: 'PRODUCT_BUG',
                longName: 'Product Bug',
                shortName: 'PB1',
                color: '#ffffff',
              },
            ],
          },
        },
      });
    });

    test('should handle DELETE_DEFECT_SUBTYPE_SUCCESS', () => {
      const payload = {
        id: 3,
        typeRef: 'PRODUCT_BUG',
      };
      const state = {
        configuration: { subTypes: { PRODUCT_BUG: [{ id: 1 }, { id: 2 }, { id: 3 }] } },
      };
      const newState = projectInfoReducer(state, {
        type: DELETE_DEFECT_SUBTYPE_SUCCESS,
        payload,
      });
      expect(newState).toEqual({
        configuration: {
          subTypes: {
            PRODUCT_BUG: [{ id: 1 }, { id: 2 }],
          },
        },
      });
    });
  });

  describe('projectPreferencesReducer', () => {
    test('should return initial state', () => {
      expect(projectPreferencesReducer(undefined, {})).toBe(PROJECT_PREFERENCES_INITIAL_STATE);
    });

    test('should return old state on unknown action', () => {
      const oldState = { filters: ['filter1'] };
      expect(projectPreferencesReducer(oldState, { type: 'foo' })).toBe(oldState);
    });

    test('shoud handle FETCH_PROJECT_PREFERENCES_SUCCESS', () => {
      const payload = { filters: ['filter1'] };
      const newState = projectPreferencesReducer(PROJECT_INFO_INITIAL_STATE, {
        type: FETCH_PROJECT_PREFERENCES_SUCCESS,
        payload,
      });
      expect(newState).toEqual(payload);
    });

    test('should handle UPDATE_FILTER_SUCCESS', () => {
      const oldState = {
        ...PROJECT_PREFERENCES_INITIAL_STATE,
        filters: [{ id: 'filter0' }],
      };
      const payload = { id: 'filter1' };
      const stateWithFilter = projectPreferencesReducer(oldState, {
        type: UPDATE_FILTER_SUCCESS,
        payload,
      });
      expect(stateWithFilter).toEqual({
        ...oldState,
        filters: [...oldState.filters, payload],
      });

      const newPayload = { id: 'filter2' };
      const stateWithUpdatedFilter = projectPreferencesReducer(stateWithFilter, {
        type: UPDATE_FILTER_SUCCESS,
        payload: newPayload,
        meta: {
          oldId: 'filter1',
        },
      });
      expect(stateWithUpdatedFilter).toEqual({
        ...oldState,
        filters: [...oldState.filters, newPayload],
      });
    });

    test('should handle ADD_FILTER', () => {
      const oldState = {
        ...PROJECT_PREFERENCES_INITIAL_STATE,
        filters: [{ id: 'filter0' }],
      };
      const payload = { id: 'filter1' };
      const updatedState = projectPreferencesReducer(oldState, {
        type: ADD_FILTER,
        payload,
      });
      expect(updatedState).toEqual({
        ...oldState,
        filters: [...oldState.filters, payload],
      });
    });

    test('should handle REMOVE_FILTER', () => {
      const oldState = {
        ...PROJECT_PREFERENCES_INITIAL_STATE,
        filters: [{ id: 'filter0' }],
      };
      const payload = 'filter0';
      const updatedState = projectPreferencesReducer(oldState, {
        type: REMOVE_FILTER,
        payload,
      });
      expect(updatedState).toEqual({
        ...oldState,
        filters: [],
      });
    });

    test('should handle ADD_PATTERN_SUCCESS', () => {
      const oldState = {
        ...PROJECT_INFO_INITIAL_STATE,
        configuration: {
          ...PROJECT_INFO_INITIAL_STATE.configuration,
          patterns: [
            {
              id: 1,
            },
          ],
        },
      };
      const payload = {
        id: 2,
        name: 'pattern 2',
        type: 'STRING',
        value: 'pattern condition - 2',
        enabled: true,
      };
      const newState = projectInfoReducer(oldState, {
        type: ADD_PATTERN_SUCCESS,
        payload,
      });
      expect(newState).toEqual({
        configuration: {
          patterns: [
            { id: 1 },
            {
              id: 2,
              name: 'pattern 2',
              type: 'STRING',
              value: 'pattern condition - 2',
              enabled: true,
            },
          ],
        },
      });
    });

    test('should handle UPDATE_PATTERN_SUCCESS', () => {
      const oldState = {
        ...PROJECT_INFO_INITIAL_STATE,
        configuration: {
          ...PROJECT_INFO_INITIAL_STATE.configuration,
          patterns: [
            {
              id: 1,
              name: 'pattern name',
              type: 'STRING',
              value: 'pattern condition',
              enabled: true,
            },
            { id: 2 },
          ],
        },
      };
      const payload = {
        id: 1,
        name: 'edited pattern name',
        type: 'STRING',
        value: 'pattern condition',
        enabled: false,
      };
      const newState = projectInfoReducer(oldState, {
        type: UPDATE_PATTERN_SUCCESS,
        payload,
      });
      expect(newState).toEqual({
        configuration: {
          patterns: [payload, { id: 2 }],
        },
      });
    });

    test('should handle DELETE_PATTERN_SUCCESS', () => {
      const oldState = {
        ...PROJECT_INFO_INITIAL_STATE,
        configuration: {
          ...PROJECT_INFO_INITIAL_STATE.configuration,
          patterns: [
            {
              id: 1,
              name: 'pattern name',
              type: 'STRING',
              value: 'pattern condition',
              enabled: true,
            },
            { id: 2 },
          ],
        },
      };
      const payload = { id: 1 };
      const newState = projectInfoReducer(oldState, {
        type: DELETE_PATTERN_SUCCESS,
        payload,
      });
      expect(newState).toEqual({
        configuration: {
          patterns: [{ id: 2 }],
        },
      });
    });
  });
});
