import {
  toggleItemSelectionAction,
  toggleAllItemsAction,
  defineGroupOperation,
  unselectAllItemsAction,
} from 'controllers/groupOperations';
import { showModalAction } from 'controllers/modal';
import {
  FETCH_PROJECTS,
  START_SET_VIEW_MODE,
  NAMESPACE,
  DELETE_PROJECT,
  REDIRECT_TO_PROJECT,
  CONFIRM_ASSIGN_TO_PROJECT,
} from './constants';

export const fetchProjectsAction = (params) => ({
  type: FETCH_PROJECTS,
  payload: params,
});

export const startSetViewMode = (viewMode) => ({
  type: START_SET_VIEW_MODE,
  payload: { viewMode },
});

export const toggleProjectSelectionAction = toggleItemSelectionAction(NAMESPACE);
export const toggleAllProjectsAction = toggleAllItemsAction(NAMESPACE);
export const unselectAllProjectsAction = unselectAllItemsAction(NAMESPACE);

export const deleteItemsAction = defineGroupOperation(
  NAMESPACE,
  'deleteProjects',
  (items, { onConfirm, header, mainContent, userId, warning, eventsInfo }) =>
    showModalAction({
      id: 'deleteItemsModal',
      data: { items, onConfirm, header, mainContent, userId, warning, eventsInfo },
    }),
  () => {},
);

export const deleteProjectAction = (project) => ({
  type: DELETE_PROJECT,
  payload: project,
});

export const redirectToProjectAction = (project) => ({
  type: REDIRECT_TO_PROJECT,
  payload: project,
});

export const confirmAssignToProject = (project) => ({
  type: CONFIRM_ASSIGN_TO_PROJECT,
  payload: project,
});
