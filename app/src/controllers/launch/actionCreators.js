import { showModalAction } from 'controllers/modal';
import {
  TOGGLE_LAUNCH_SELECTION,
  SELECT_LAUNCHES,
  UNSELECT_ALL_LAUNCHES,
  SET_VALIDATION_ERRORS,
  REMOVE_VALIDATION_ERROR,
  SET_LAST_OPERATION_NAME,
  FETCH_LAUNCHES,
} from './constants';
import { lastOperationSelector, selectedLaunchesSelector } from './selectors';
import { validateMergeLaunch } from './actionValidators';

const setValidationErrorsAction = (errors) => ({
  type: SET_VALIDATION_ERRORS,
  payload: errors,
});
const resetValidationErrorsAction = () => ({
  type: SET_VALIDATION_ERRORS,
  payload: {},
});
const removeValidationError = (id) => ({
  type: REMOVE_VALIDATION_ERROR,
  payload: id,
});

export const toggleLaunchSelectionAction = (launch) => (dispatch) => {
  dispatch(removeValidationError(launch.id));
  dispatch({
    type: TOGGLE_LAUNCH_SELECTION,
    payload: launch,
  });
};
export const selectLaunchesAction = (launches) => ({
  type: SELECT_LAUNCHES,
  payload: launches,
});
export const unselectAllLaunchesAction = () => (dispatch) => {
  dispatch(resetValidationErrorsAction());
  dispatch({
    type: UNSELECT_ALL_LAUNCHES,
  });
};

const setLastOperationNameAction = (operationName) => ({
  type: SET_LAST_OPERATION_NAME,
  payload: operationName,
});

const validateLaunches = (launches = [], validator, state) =>
  launches.reduce((acc, launch) => {
    const error = validator(launch, launches, state);
    if (error) {
      return { ...acc, [launch.id]: error };
    }
    return acc;
  }, {});

const groupOperationMap = {};

const defineGroupOperation = (name, operationAction, validator) => {
  groupOperationMap[name] = {
    action: operationAction,
    validator,
  };
  return (fetchFunc = () => {}) => (dispatch, getState) => {
    const launches = selectedLaunchesSelector(getState());
    if (launches.length === 0) {
      return;
    }
    dispatch(setLastOperationNameAction(name));
    dispatch(resetValidationErrorsAction());
    const errors = validateLaunches(launches, validator, getState());
    if (Object.keys(errors).length > 0) {
      dispatch(setValidationErrorsAction(errors));
      return;
    }
    dispatch(setLastOperationNameAction(''));
    dispatch(operationAction(launches, fetchFunc));
  };
};

export const proceedWithValidItemsAction = (fetchFunc) => (dispatch, getState) => {
  const actionName = lastOperationSelector(getState());
  const launches = selectedLaunchesSelector(getState());
  const { action, validator } = groupOperationMap[actionName];
  const validItems = launches.filter((launch) => !validator(launch, launches, getState()));
  const launchesToValidate = validItems.length > 0 ? validItems : launches;
  const errors = validateLaunches(launchesToValidate, validator, getState());
  if (Object.keys(errors).length > 0) {
    dispatch(setValidationErrorsAction(errors));
    return;
  }
  dispatch(action(validItems, fetchFunc));
  dispatch(selectLaunchesAction(validItems));
  dispatch(setLastOperationNameAction(''));
  dispatch(resetValidationErrorsAction());
};

const MODAL_COMPARE_WIDTH = 900;

export const mergeLaunchesAction = defineGroupOperation(
  'mergeLaunches',
  (launches, fetchFunc) =>
    showModalAction({
      id: 'launchMergeModal',
      data: { launches, fetchFunc },
    }),
  validateMergeLaunch,
);
export const compareLaunchesAction = defineGroupOperation(
  'compareLaunches',
  (launches) =>
    showModalAction({
      id: 'launchCompareModal',
      width: MODAL_COMPARE_WIDTH,
      data: { ids: launches.map((launch) => launch.id) },
    }),
  () => null,
);

export const fetchLaunches = (params) => ({
  type: FETCH_LAUNCHES,
  payload: params,
});
