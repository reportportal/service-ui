/*
 * Copyright 2026 EPAM Systems
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

import { SHOW_DEFAULT_ERROR_NOTIFICATION } from 'controllers/notification/constants';
import { runSaga } from 'redux-saga';
import { LOGOUT } from 'controllers/auth/constants';
import { clearWidgetCache } from 'pages/inside/dashboardItemPage/widgetsGrid/widget/widgetCache';
import { updateDashboardWidgets, dashboardSagas } from './sagas';
import { fetchDashboardAction, updateDashboardItemSuccessAction } from './actionCreators';

jest.mock('pages/inside/dashboardItemPage/widgetsGrid/widget/widgetCache', () => ({
  clearWidgetCache: jest.fn(),
}));

describe('controllers/dashboard/sagas updateDashboardWidgets', () => {
  const dashboard = { id: 1, name: 'd', widgets: [] };

  test('saves the layout and stores it on success', () => {
    const gen = updateDashboardWidgets({ payload: dashboard });
    gen.next(); // select projectKey
    gen.next('project'); // PUT
    expect(gen.next().value.PUT.action).toEqual(updateDashboardItemSuccessAction(dashboard));
  });

  test('shows an error and reloads the dashboard when saving fails', () => {
    const gen = updateDashboardWidgets({ payload: dashboard });
    gen.next();
    gen.next('project');
    const errorStep = gen.throw({ message: 'Dashboard is locked' });
    expect(errorStep.value.PUT.action.type).toBe(SHOW_DEFAULT_ERROR_NOTIFICATION);
    expect(errorStep.value.PUT.action.payload.error).toBe('Dashboard is locked');
    gen.next(); // select active dashboard id
    expect(gen.next('1').value.PUT.action).toEqual(fetchDashboardAction());
    expect(gen.next().done).toBe(true);
  });

  test('does not reload the dashboard when saving fails after the user left it', () => {
    const gen = updateDashboardWidgets({ payload: dashboard });
    gen.next();
    gen.next('project');
    gen.throw({ message: 'Dashboard is locked' });
    gen.next(); // select active dashboard id
    expect(gen.next(undefined).done).toBe(true);
  });
});

describe('controllers/dashboard/sagas logout', () => {
  test('the logout action clears the widget cache', () => {
    let emit;
    const task = runSaga(
      {
        subscribe: (callback) => {
          emit = callback;
          return () => {};
        },
        dispatch: () => {},
        getState: () => ({}),
      },
      dashboardSagas,
    );
    expect(clearWidgetCache).not.toHaveBeenCalled();
    emit({ type: LOGOUT });
    expect(clearWidgetCache).toHaveBeenCalledTimes(1);
    task.cancel();
  });
});
