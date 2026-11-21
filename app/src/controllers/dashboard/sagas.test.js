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
import { updateDashboardWidgets } from './sagas';
import { fetchDashboardAction, updateDashboardItemSuccessAction } from './actionCreators';

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
    expect(gen.next().value.PUT.action).toEqual(fetchDashboardAction());
    expect(gen.next().done).toBe(true);
  });
});
