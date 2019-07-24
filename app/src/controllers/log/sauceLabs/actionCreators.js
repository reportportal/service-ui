import {
  EXECUTE_SAUCE_LABS_COMMAND_ACTION,
  BULK_EXECUTE_SAUCE_LABS_COMMAND_ACTION,
  SET_AUTH_TOKEN_ACTION,
  UPDATE_LOADING_ACTION,
} from './constants';

export const executeSauceLabsCommandAction = (command, integrationId, data) => ({
  type: EXECUTE_SAUCE_LABS_COMMAND_ACTION,
  payload: { command, integrationId, data },
});

export const bulkExecuteSauceLabsCommandAction = (commands, data) => ({
  type: BULK_EXECUTE_SAUCE_LABS_COMMAND_ACTION,
  payload: { commands, data },
});

export const setAuthTokenAction = (payload) => ({
  type: SET_AUTH_TOKEN_ACTION,
  payload,
});

export const updateLoadingAction = (payload) => ({
  type: UPDATE_LOADING_ACTION,
  payload,
});
