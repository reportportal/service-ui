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

import { fetchErrorAction, fetchSuccessAction } from 'controllers/fetch';
import { AppState } from 'types/store';
import { manualLaunchesReducer as untypedReducer } from './reducer';
import { ACTIVE_MANUAL_LAUNCH_NAMESPACE, MANUAL_LAUNCHES_NAMESPACE } from './constants';
import {
  activeManualLaunchLoadFailedSelector,
  manualLaunchesLoadFailedSelector,
} from './selectors';

type LaunchState = Record<string, unknown> | undefined;

const manualLaunchesReducer = untypedReducer as (
  state: LaunchState,
  action: { type: string },
) => LaunchState;

const reduce = (...actions: Array<{ type: string }>) =>
  actions.reduce<LaunchState>(
    (state, action) => manualLaunchesReducer(state, action),
    manualLaunchesReducer(undefined, { type: '@@INIT' }),
  );

const asAppState = (manualLaunch: LaunchState) => ({ manualLaunch }) as unknown as AppState;

describe('controllers/manualLaunch/reducer load failures', () => {
  test('a failed launch load that is not "not found" is marked as failed', () => {
    const state = reduce(fetchErrorAction(ACTIVE_MANUAL_LAUNCH_NAMESPACE, { errorCode: 5000 }));

    expect(activeManualLaunchLoadFailedSelector(asAppState(state))).toBe(true);
  });

  test('a missing launch is not a failed load', () => {
    const state = reduce(fetchErrorAction(ACTIVE_MANUAL_LAUNCH_NAMESPACE, { errorCode: 40430 }));

    expect(activeManualLaunchLoadFailedSelector(asAppState(state))).toBe(false);
  });

  test('a successful reload clears the failed state of the launch list', () => {
    const failed = reduce(fetchErrorAction(MANUAL_LAUNCHES_NAMESPACE, { errorCode: 5000 }));

    expect(manualLaunchesLoadFailedSelector(asAppState(failed))).toBe(true);

    const reloaded = manualLaunchesReducer(
      failed,
      fetchSuccessAction(MANUAL_LAUNCHES_NAMESPACE, { data: { content: [], page: {} } }),
    );

    expect(manualLaunchesLoadFailedSelector(asAppState(reloaded))).toBe(false);
  });
});
