import { defineGroupOperation } from 'controllers/groupOperations';
import { showModalAction } from 'controllers/modal';
import { validateDeleteItem } from './actionValidators';
import {
  FETCH_TEST_ITEMS,
  SET_LEVEL,
  RESTORE_PATH,
  SET_PAGE_LOADING,
  NAMESPACE,
  FETCH_TEST_ITEMS_LOG_PAGE,
} from './constants';

export const setLevelAction = (level) => ({
  type: SET_LEVEL,
  payload: level,
});

export const fetchTestItemsAction = (options) => ({
  type: FETCH_TEST_ITEMS,
  payload: options,
});

export const restorePathAction = () => ({
  type: RESTORE_PATH,
});

export const setPageLoadingAction = (isLoading) => ({
  type: SET_PAGE_LOADING,
  payload: isLoading,
});

export const fetchTestItemsFromLogPageAction = (payload) => ({
  type: FETCH_TEST_ITEMS_LOG_PAGE,
  payload,
});


export const deleteItemsAction = defineGroupOperation(
  NAMESPACE,
  'deleteTestItems',
  (items, { onConfirm, header, mainContent, userId, currentLaunch, warning, eventsInfo }) =>
    showModalAction({
      id: 'deleteItemsModal',
      data: { items, onConfirm, header, mainContent, userId, currentLaunch, warning, eventsInfo },
    }),
  validateDeleteItem,
);
