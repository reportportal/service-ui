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
