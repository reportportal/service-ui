import { showModalAction } from 'controllers/modal';
import {
  defineGroupOperation,
  selectItemsAction,
  unselectAllItemsAction,
  toggleItemSelectionAction,
  createProceedWithValidItemsAction,
} from 'controllers/groupOperations';
import { FETCH_LAUNCHES, NAMESPACE, FETCH_LAUNCH } from './constants';
import { validateMergeLaunch } from './actionValidators';

export const fetchLaunchesAction = (params) => ({
  type: FETCH_LAUNCHES,
  payload: params,
});

export const fetchLaunchAction = (launchId) => ({
  type: FETCH_LAUNCH,
  payload: launchId,
});

export const toggleLaunchSelectionAction = toggleItemSelectionAction(NAMESPACE);
export const selectLaunchesAction = selectItemsAction(NAMESPACE);
export const unselectAllLaunchesAction = unselectAllItemsAction(NAMESPACE);

export const proceedWithValidItemsAction = createProceedWithValidItemsAction(NAMESPACE);

const MODAL_COMPARE_WIDTH = 900;

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
