import {
  createProceedWithValidItemsAction,
  selectItemsAction,
  toggleItemSelectionAction,
  unselectAllItemsAction,
} from 'controllers/groupOperations';
import { NAMESPACE, FETCH_SUITES } from './constants';

export const fetchSuitesAction = (params) => ({
  type: FETCH_SUITES,
  payload: params,
});

export const toggleSuiteSelectionAction = toggleItemSelectionAction(NAMESPACE);
export const selectSuitesAction = selectItemsAction(NAMESPACE);
export const unselectAllSuitesAction = unselectAllItemsAction(NAMESPACE);

export const proceedWithValidItemsAction = createProceedWithValidItemsAction(NAMESPACE);
