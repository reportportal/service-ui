export const SAUCE_LABS_NAMESPACE = 'log/sauceLabs';
export const JOB_INFO_NAMESPACE = `${SAUCE_LABS_NAMESPACE}/jobInfo`;
export const SAUCE_LABS_LOGS_NAMESPACE = `${SAUCE_LABS_NAMESPACE}/logs`;
export const SAUCE_LABS_ASSETS_NAMESPACE = `${SAUCE_LABS_NAMESPACE}/assets`;

export const EXECUTE_SAUCE_LABS_COMMAND_ACTION = 'executeSauceLabsCommandAction';
export const BULK_EXECUTE_SAUCE_LABS_COMMAND_ACTION = 'bulkExecuteSauceLabsCommandAction';
export const SET_AUTH_TOKEN_ACTION = 'setAuthTokenAction';
export const UPDATE_LOADING_ACTION = 'updateLoadingAction';

export const SAUCE_LABS_JOB_INFO_COMMAND = 'jobInfo';
export const SAUCE_LABS_LOGS_COMMAND = 'logs';
export const SAUCE_LABS_ASSETS_COMMAND = 'assets';
export const SAUCE_LABS_TEST_COMMAND = 'test';

export const SAUCE_LABS_COMMANDS_NAMESPACES_MAP = {
  [SAUCE_LABS_JOB_INFO_COMMAND]: JOB_INFO_NAMESPACE,
  [SAUCE_LABS_LOGS_COMMAND]: SAUCE_LABS_LOGS_NAMESPACE,
  [SAUCE_LABS_ASSETS_COMMAND]: SAUCE_LABS_ASSETS_NAMESPACE,
};
