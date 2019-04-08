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
      const payload = {
        id: 1,
        typeRef: 'PRODUCT_BUG',
        longName: 'Product Bug',
        shortName: 'PB1',
        color: '#ffffff',
      };
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
  });
});
