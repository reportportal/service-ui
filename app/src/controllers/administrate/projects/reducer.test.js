import { ASSIGN_TO_RROJECT_SUCCESS, UNASSIGN_FROM_PROJECT_SUCCESS } from 'controllers/user';
import { FETCH_SUCCESS } from 'controllers/fetch';
import { SET_PROJECTS_VIEW_MODE, TABLE_VIEW, GRID_VIEW, NAMESPACE } from './constants';
import { setViewModeReducer, assignProjectReducer, projectFetchReducer } from './reducer';

const VIEW_MODE_INITIAL_STATE = GRID_VIEW;
const PROJECTS = [
  {
    id: 1,
    projectName: 'superadmin_personal',
    usersQuantity: 3,
    launchesQuantity: 36,
    launchesPerUser: null,
    uniqueTickets: null,
    launchesPerWeek: null,
    lastRun: 1553585182771,
    creationDate: 1553072627019,
    entryType: 'PERSONAL',
    organization: null,
  },
];
const PROJECTS_AFTER_ASSIGN = [
  {
    id: 1,
    projectName: 'superadmin_personal',
    usersQuantity: 4,
    launchesQuantity: 36,
    launchesPerUser: null,
    uniqueTickets: null,
    launchesPerWeek: null,
    lastRun: 1553585182771,
    creationDate: 1553072627019,
    entryType: 'PERSONAL',
    organization: null,
  },
];

const PROJECTS_AFTER_UNASSIGN = [
  {
    id: 1,
    projectName: 'superadmin_personal',
    usersQuantity: 2,
    launchesQuantity: 36,
    launchesPerUser: null,
    uniqueTickets: null,
    launchesPerWeek: null,
    lastRun: 1553585182771,
    creationDate: 1553072627019,
    entryType: 'PERSONAL',
    organization: null,
  },
];

describe('projects reducer', () => {
  describe('setViewModeReducer', () => {
    test('should return initial state', () => {
      expect(setViewModeReducer(undefined, {})).toBe(VIEW_MODE_INITIAL_STATE);
    });

    test('should return old state on unknown action', () => {
      const oldState = TABLE_VIEW;
      expect(setViewModeReducer(oldState, { type: 'foo' })).toBe(oldState);
    });

    test('should handle SET_PROJECTS_VIEW_MODE', () => {
      const payload = TABLE_VIEW;
      const newState = setViewModeReducer(VIEW_MODE_INITIAL_STATE, {
        type: SET_PROJECTS_VIEW_MODE,
        payload,
      });
      expect(newState).toEqual(payload);
    });
  });

  describe('projectFetchReducer', () => {
    test('should return initial state', () => {
      expect(projectFetchReducer(undefined, {})).toEqual([]);
    });

    test('should return old state on unknown action', () => {
      const oldState = PROJECTS;
      expect(projectFetchReducer(oldState, {})).toBe(oldState);
    });

    test('should ignore unsuitable namespaces', () => {
      const payload = PROJECTS;
      const newState = projectFetchReducer(undefined, {
        type: FETCH_SUCCESS,
        payload,
        meta: {
          namespace: 'other',
        },
      });
      expect(newState).toEqual([]);
    });

    test('should handle FETCH_SUCCESS', () => {
      const payload = { content: PROJECTS };
      const newState = projectFetchReducer(undefined, {
        type: FETCH_SUCCESS,
        payload,
        meta: {
          namespace: NAMESPACE,
        },
      });
      expect(newState).toEqual(PROJECTS);
    });
  });

  describe('assignProjectReducer', () => {
    test('should return initial state', () => {
      expect(assignProjectReducer(undefined, {})).toEqual([]);
    });

    test('should return old state on unknown action', () => {
      const oldState = PROJECTS;
      expect(assignProjectReducer(oldState, [{ id: 2 }])).toBe(oldState);
    });

    test('should handle ASSIGN_TO_RROJECT_SUCCESS', () => {
      const payload = {
        projectName: PROJECTS[0].projectName,
      };
      const newState = assignProjectReducer(PROJECTS, {
        type: ASSIGN_TO_RROJECT_SUCCESS,
        payload,
      });
      expect(newState).toEqual(PROJECTS_AFTER_ASSIGN);
    });

    test('should handle UNASSIGN_FROM_PROJECT_SUCCESS', () => {
      const oldState = PROJECTS;
      const payload = {
        projectName: PROJECTS[0].projectName,
      };
      const newState = assignProjectReducer(oldState, {
        type: UNASSIGN_FROM_PROJECT_SUCCESS,
        payload,
      });
      expect(newState).toEqual(PROJECTS_AFTER_UNASSIGN);
    });
  });
});
