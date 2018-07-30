import {
  createProceedWithValidItemsAction,
  selectItemsAction,
  toggleItemSelectionAction,
  unselectAllItemsAction,
  toggleAllItemsAction,
} from 'controllers/groupOperations';
import { NAMESPACE, FETCH_TESTS } from './constants';

export const fetchTestsAction = (params) => ({
  type: FETCH_TESTS,
  payload: params,
});

export const toggleTestSelectionAction = toggleItemSelectionAction(NAMESPACE);
export const selectTestsAction = selectItemsAction(NAMESPACE);
export const unselectAllTestsAction = unselectAllItemsAction(NAMESPACE);
export const toggleAllTestsAction = toggleAllItemsAction(NAMESPACE);

export const proceedWithValidItemsAction = createProceedWithValidItemsAction(NAMESPACE);
