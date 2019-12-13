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

import { showModalAction } from 'controllers/modal';
import {
  defineGroupOperation,
  selectItemsAction,
  unselectAllItemsAction,
  toggleItemSelectionAction,
  createProceedWithValidItemsAction,
  toggleAllItemsAction,
} from 'controllers/groupOperations';
import {
  FETCH_LAUNCHES,
  NAMESPACE,
  SET_DEBUG_MODE,
  CHANGE_LAUNCH_DISTINCT,
  FETCH_LAUNCHES_WITH_PARAMS,
  FETCH_LAUNCHES_PAGE_DATA,
  UPDATE_LAUNCH_LOCALLY,
  UPDATE_LAUNCHES_LOCALLY,
  UPDATE_LOCAL_SORTING,
  DEFAULT_LOCAL_SORTING,
  UPDATE_DEBUG_LOCAL_SORTING,
  UPDATE_DEBUG_LOCAL_FILTER,
} from './constants';
import {
  validateMergeLaunch,
  validateFinishForceLaunch,
  validateMoveLaunch,
  validateDeleteLaunch,
} from './actionValidators';

export const setDebugMode = (isDebugMode) => ({
  type: SET_DEBUG_MODE,
  payload: isDebugMode,
});

export const changeLaunchDistinctAction = (launchDistinct) => ({
  type: CHANGE_LAUNCH_DISTINCT,
  payload: launchDistinct,
});

export const fetchLaunchesAction = (params) => ({
  type: FETCH_LAUNCHES,
  payload: params,
});

export const fetchLaunchesWithParamsAction = (filterId) => ({
  type: FETCH_LAUNCHES_WITH_PARAMS,
  payload: filterId,
});

export const fetchLaunchesPageData = () => ({
  type: FETCH_LAUNCHES_PAGE_DATA,
});

export const updateLaunchLocallyAction = (launch) => ({
  type: UPDATE_LAUNCH_LOCALLY,
  payload: launch,
});

export const updateLaunchesLocallyAction = (launches) => ({
  type: UPDATE_LAUNCHES_LOCALLY,
  payload: launches,
});

export const updateLocalSortingAction = (sorting) => ({
  type: UPDATE_LOCAL_SORTING,
  payload: sorting,
});

export const resetLocalSortingAction = () => updateLocalSortingAction(DEFAULT_LOCAL_SORTING);

export const updateDebugLocalSortingAction = (sorting) => ({
  type: UPDATE_DEBUG_LOCAL_SORTING,
  payload: sorting,
});

export const resetDebugLocalSortingAction = () =>
  updateDebugLocalSortingAction(DEFAULT_LOCAL_SORTING);

export const updateDebugLocalFilterAction = (filter) => ({
  type: UPDATE_DEBUG_LOCAL_FILTER,
  payload: filter,
});

export const resetDebugLocalFilterAction = () => updateDebugLocalFilterAction({});

export const toggleLaunchSelectionAction = toggleItemSelectionAction(NAMESPACE);
export const selectLaunchesAction = selectItemsAction(NAMESPACE);
export const unselectAllLaunchesAction = unselectAllItemsAction(NAMESPACE);
export const toggleAllLaunchesAction = toggleAllItemsAction(NAMESPACE);

export const proceedWithValidItemsAction = createProceedWithValidItemsAction(NAMESPACE);

const MODAL_COMPARE_WIDTH = 900;

export const forceFinishLaunchesAction = defineGroupOperation(
  NAMESPACE,
  'finishForceLaunches',
  (launches, { fetchFunc }) =>
    showModalAction({
      id: 'launchFinishForceModal',
      data: { items: launches, fetchFunc },
    }),
  validateFinishForceLaunch,
);
export const mergeLaunchesAction = defineGroupOperation(
  NAMESPACE,
  'mergeLaunches',
  (launches, { fetchFunc }) =>
    showModalAction({
      id: 'launchMergeModal',
      data: { launches, fetchFunc },
    }),
  validateMergeLaunch,
);
export const compareLaunchesAction = defineGroupOperation(
  NAMESPACE,
  'compareLaunches',
  (launches) =>
    showModalAction({
      id: 'launchCompareModal',
      width: MODAL_COMPARE_WIDTH,
      data: { ids: launches.map((launch) => launch.id) },
    }),
  () => null,
);
export const moveLaunchesAction = defineGroupOperation(
  NAMESPACE,
  'moveLaunches',
  (launches, { fetchFunc, debugMode }) =>
    showModalAction({
      id: 'moveLaunchesModal',
      data: { ids: launches.map((launch) => launch.id), fetchFunc, debugMode },
    }),
  validateMoveLaunch,
);
export const deleteItemsAction = defineGroupOperation(
  NAMESPACE,
  'deleteLaunches',
  (items, { onConfirm, header, mainContent, userId, warning, eventsInfo }) =>
    showModalAction({
      id: 'deleteItemsModal',
      data: { items, onConfirm, header, mainContent, userId, warning, eventsInfo },
    }),
  validateDeleteLaunch,
);
