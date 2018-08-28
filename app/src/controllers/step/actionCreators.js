import {
  createProceedWithValidItemsAction,
  selectItemsAction,
  toggleItemSelectionAction,
  unselectAllItemsAction,
  defineGroupOperation,
} from 'controllers/groupOperations';
import { showModalAction } from 'controllers/modal';
import { NAMESPACE } from './constants';
import {
  validateIgnoreInAA,
  validateIncludeInAA,
  validateUnlinkIssue,
  validateEditDefect,
} from './actionValidators';

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

export const includeInAutoAnalysisAction = defineGroupOperation(
  NAMESPACE,
  'include-in-aa',
  (items, { fetchFunc }) => showModalAction({ id: 'includeInAAModal', data: { items, fetchFunc } }),
  validateIncludeInAA,
);

export const unlinkIssueAction = defineGroupOperation(
  NAMESPACE,
  'unlink-issue',
  (items, { fetchFunc }) => showModalAction({ id: 'unlinkIssueModal', data: { items, fetchFunc } }),
  validateUnlinkIssue,
);

export const editDefectsAction = defineGroupOperation(
  NAMESPACE,
  'edit-defect',
  (items, { fetchFunc }) => showModalAction({ id: 'editDefectModal', data: { items, fetchFunc } }),
  validateEditDefect,
);
