import { runSaga } from 'redux-saga';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import {
  setProjectNotificationsLoadingAction,
  fetchProjectNotificationsSuccessAction,
  fetchExistingLaunchNamesSuccessAction,
} from './actionCreators';
import { fetchProjectNotifications, fetchExistingLaunchNames } from './sagas';

jest.mock('common/utils', () => ({
  fetch: jest.fn(),
}));

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
});
