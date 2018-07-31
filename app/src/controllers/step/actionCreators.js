import {
  createProceedWithValidItemsAction,
  selectItemsAction,
  toggleItemSelectionAction,
  unselectAllItemsAction,
  defineGroupOperation,
} from 'controllers/groupOperations';
import { showModalAction } from 'controllers/modal';
import { NAMESPACE } from './constants';
import { validateIgnoreInAA } from './actionValidators';

export const toggleStepSelectionAction = toggleItemSelectionAction(NAMESPACE);
export const selectStepsAction = selectItemsAction(NAMESPACE);
export const unselectAllStepsAction = unselectAllItemsAction(NAMESPACE);

export const proceedWithValidItemsAction = createProceedWithValidItemsAction(NAMESPACE);

export const ignoreInAutoAnalysisAction = defineGroupOperation(
  NAMESPACE,
  'ignore-in-aa',
  (items, { fetchFunc }) => showModalAction({ id: 'ignoreInAAModal', data: { items, fetchFunc } }),
  validateIgnoreInAA,
);
