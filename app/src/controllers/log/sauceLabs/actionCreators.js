import {
  EXECUTE_SAUCE_LABS_COMMAND_ACTION,
  BULK_EXECUTE_SAUCE_LABS_COMMAND_ACTION,
  SET_INTEGRATION_DATA_ACTION,
} from './constants';

export const executeSauceLabsCommandAction = (command, data, integrationId) => ({
  type: EXECUTE_SAUCE_LABS_COMMAND_ACTION,
  payload: { command, data, integrationId },
});

export const bulkExecuteSauceLabsCommandAction = (commands, data) => ({
  type: BULK_EXECUTE_SAUCE_LABS_COMMAND_ACTION,
  payload: { commands, data },
});

export const setIntegrationDataAction = (payload) => ({
  type: SET_INTEGRATION_DATA_ACTION,
  payload,
});
