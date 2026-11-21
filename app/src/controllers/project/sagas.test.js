import { runSaga } from 'redux-saga';
import { all, takeEvery } from 'redux-saga/effects';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { setActiveProjectAction } from 'controllers/user';
import { showDefaultErrorNotification } from 'controllers/notification';
import { SET_ACTIVE_PROJECT, SET_ACTIVE_PROJECT_KEY } from 'controllers/user/constants';
import {
  setProjectNotificationsLoadingAction,
  fetchProjectNotificationsSuccessAction,
  fetchExistingLaunchNamesSuccessAction,
  prepareActiveProjectAction,
} from './actionCreators';
import { FETCH_PROJECT, PREPARE_ACTIVE_PROJECT } from './constants';
import {
  fetchProjectNotifications,
  fetchExistingLaunchNames,
  fetchProject,
  prepareActiveProject,
  fetchProjectPreferences,
  fetchConfigurationAttributes,
  updateProjectFilterPreferences,
} from './sagas';

jest.mock('common/utils', () => ({
  fetch: jest.fn(),
}));

jest.mock('controllers/pages', () => ({
  ...jest.requireActual('controllers/pages'),
  userRolesSelector: () => ({}),
}));

const ROUTE_TYPE = 'PROJECT_DASHBOARD_PAGE';

const createProjectNavigationStore = () => {
  const listeners = [];
  const dispatched = [];
  const state = {
    organizations: { organization: { activeOrganization: { id: 1, slug: 'org' } } },
    user: { activeProject: {}, activeProjectKey: '' },
  };
  const store = {
    dispatched,
    getState: () => state,
    subscribe: (listener) => {
      listeners.push(listener);
      return () => listeners.splice(listeners.indexOf(listener), 1);
    },
    dispatch: (action) => {
      dispatched.push(action);
      if (action.type === SET_ACTIVE_PROJECT) {
        state.user = { ...state.user, activeProject: action.payload };
      }
      if (action.type === SET_ACTIVE_PROJECT_KEY) {
        state.user = { ...state.user, activeProjectKey: action.payload };
      }
      listeners.slice().forEach((listener) => listener(action));
      return action;
    },
  };
  // Mirrors organizationProjectRouteMiddleware: set the active project, then prepare it.
  store.navigate = (projectSlug) => {
    const action = { type: ROUTE_TYPE, payload: { organizationSlug: 'org', projectSlug } };
    store.dispatch(setActiveProjectAction({ organizationSlug: 'org', projectSlug }));
    store.dispatch(
      prepareActiveProjectAction({
        organizationSlug: 'org',
        projectSlug,
        projectKey: projectSlug.toUpperCase(),
        action,
      }),
    );
  };
  return store;
};

function* projectNavigationSaga() {
  yield all([
    takeEvery(PREPARE_ACTIVE_PROJECT, prepareActiveProject),
    takeEvery(FETCH_PROJECT, fetchProject),
  ]);
}

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('controllers/project/sagas', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('fetchProjectNotifications', () => {
    test('should fetch notifications from dedicated saga', async () => {
      const projectKey = 'demo';
      const notifications = [{ id: 1, type: 'email' }];
      const dispatched = [];

      fetch.mockResolvedValue(notifications);

      await runSaga(
        {
          dispatch: (action) => dispatched.push(action),
          getState: () => ({ project: { info: { projectKey } } }),
        },
        fetchProjectNotifications,
      ).done;

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(URLS.notification(projectKey));
      expect(dispatched).toEqual([
        setProjectNotificationsLoadingAction(true),
        fetchProjectNotificationsSuccessAction(notifications),
        setProjectNotificationsLoadingAction(false),
      ]);
    });
  });

  describe('fetchExistingLaunchNames', () => {
    test('should fetch existing launch names from dedicated saga', async () => {
      const projectKey = 'demo';
      const existingLaunchNames = ['launch-1', 'launch-2'];
      const dispatched = [];

      fetch.mockResolvedValue(existingLaunchNames);

      await runSaga(
        {
          dispatch: (action) => dispatched.push(action),
          getState: () => ({ project: { info: { projectKey } } }),
        },
        fetchExistingLaunchNames,
        { payload: undefined },
      ).done;

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(URLS.launchesExistingNames(projectKey));
      expect(dispatched).toEqual([fetchExistingLaunchNamesSuccessAction(existingLaunchNames)]);
    });
  });

  describe('prepareActiveProject', () => {
    test('puts only the route action of the latest project when an earlier fetch resolves last', async () => {
      const pending = {};
      fetch.mockImplementation(
        (url) =>
          new Promise((resolve) => {
            pending[url] = resolve;
          }),
      );
      const store = createProjectNavigationStore();
      const task = runSaga(store, projectNavigationSaga);

      store.navigate('a');
      store.navigate('b');
      pending[URLS.projectByName('B')]({ projectKey: 'B', integrations: [] });
      await flushPromises();
      pending[URLS.projectByName('A')]({ projectKey: 'A', integrations: [] });
      await flushPromises();
      await flushPromises();
      task.cancel();

      const routeActions = store.dispatched.filter(({ type }) => type === ROUTE_TYPE);
      expect(routeActions).toEqual([
        { type: ROUTE_TYPE, payload: { organizationSlug: 'org', projectSlug: 'b' } },
      ]);
      expect(fetch).toHaveBeenCalledTimes(2);
      expect(store.getState().user.activeProjectKey).toBe('B');
    });

    test('drops the route action of a project superseded while its fetch was in flight', async () => {
      const pending = {};
      fetch.mockImplementation(
        (url) =>
          new Promise((resolve) => {
            pending[url] = resolve;
          }),
      );
      const store = createProjectNavigationStore();
      const task = runSaga(store, projectNavigationSaga);

      store.navigate('a');
      store.navigate('b');
      pending[URLS.projectByName('A')]({ projectKey: 'A', integrations: [] });
      await flushPromises();
      pending[URLS.projectByName('B')]({ projectKey: 'B', integrations: [] });
      await flushPromises();
      await flushPromises();
      task.cancel();

      const routeActions = store.dispatched.filter(({ type }) => type === ROUTE_TYPE);
      expect(routeActions).toEqual([
        { type: ROUTE_TYPE, payload: { organizationSlug: 'org', projectSlug: 'b' } },
      ]);
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('failing project requests', () => {
    test.each([
      ['fetchProjectPreferences', fetchProjectPreferences, { payload: 'demo' }],
      ['fetchConfigurationAttributes', fetchConfigurationAttributes, { payload: 'demo' }],
      [
        'updateProjectFilterPreferences',
        updateProjectFilterPreferences,
        { payload: { filterId: 1, method: 'PUT' } },
      ],
    ])('%s shows an error notification instead of throwing', async (name, saga, action) => {
      const error = { message: 'Bad gateway' };
      const dispatched = [];
      fetch.mockRejectedValue(error);

      await runSaga(
        {
          dispatch: (dispatchedAction) => dispatched.push(dispatchedAction),
          getState: () => ({ project: { info: { projectKey: 'demo' } } }),
        },
        saga,
        action,
      ).done;

      expect(dispatched).toEqual([showDefaultErrorNotification(error)]);
    });
  });
});
