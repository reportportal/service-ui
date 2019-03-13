import {
  defineGroupOperation,
  toggleItemSelectionAction,
  toggleAllItemsAction,
  unselectAllItemsAction,
} from 'controllers/groupOperations';
import { showModalAction } from 'controllers/modal';
import { FETCH_ALL_USERS, NAMESPACE } from './constants';
import { validateDeleteUser } from './actionValidators';

export const fetchAllUsersAction = () => ({
  type: FETCH_ALL_USERS,
});

export const toggleUserSelectionAction = toggleItemSelectionAction(NAMESPACE);
export const toggleAllUsersAction = toggleAllItemsAction(NAMESPACE);
export const unselectAllUsersAction = unselectAllItemsAction(NAMESPACE);

export const deleteItemsAction = defineGroupOperation(
  NAMESPACE,
  'deleteUsers',
  (items, { onConfirm, header, mainContent, eventsInfo }) =>
    showModalAction({
      id: 'deleteItemsModal',
      data: { items, onConfirm, header, mainContent, eventsInfo },
    }),
  validateDeleteUser,
);
