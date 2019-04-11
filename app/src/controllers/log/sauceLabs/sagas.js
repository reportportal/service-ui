import { takeEvery, call, put, all, select } from 'redux-saga/effects';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { SAUCE_LABS } from 'common/constants/integrationNames';
import { showDefaultErrorNotification } from 'controllers/notification';
import { namedIntegrationsSelectorsMap } from 'controllers/project';
import { activeProjectSelector } from 'controllers/user';
import { fetchDataAction } from 'controllers/fetch';
import {
  EXECUTE_SAUCE_LABS_COMMAND_ACTION,
  BULK_EXECUTE_SAUCE_LABS_COMMAND_ACTION,
  SAUCE_LABS_COMMANDS_NAMESPACES_MAP,
} from './constants';
import { setIntegrationDataAction } from './actionCreators';

function* executeSauceLabsCommand({ command, data, integrationId }) {
  try {
    const activeProject = yield select(activeProjectSelector);

    yield put(
      fetchDataAction(SAUCE_LABS_COMMANDS_NAMESPACES_MAP[command])(
        URLS.projectIntegrationByIdCommand(activeProject, integrationId, command),
        { data, method: 'put' },
      ),
    );
  } catch (error) {
    yield put(showDefaultErrorNotification(error));
  }
}

function* bulkExecuteSauceLabsCommands({ payload: { commands, data } }) {
  const projectIntegrations = yield select(namedIntegrationsSelectorsMap[SAUCE_LABS]);
  let activeIntegration = projectIntegrations[0];
  try {
    if (!activeIntegration) {
      const globalIntegrations = yield call(fetch, URLS.globalIntegrationsByPluginName(SAUCE_LABS));
      activeIntegration = globalIntegrations[0];
    }

    yield put(setIntegrationDataAction(activeIntegration));
    yield all(
      commands.map((command) =>
        call(executeSauceLabsCommand, { command, data, integrationId: activeIntegration.id }),
      ),
    );
  } catch (error) {
    yield put(showDefaultErrorNotification(error));
  }
}

function* watchExecuteSauceLabsCommand() {
  yield takeEvery(EXECUTE_SAUCE_LABS_COMMAND_ACTION, executeSauceLabsCommand);
}

function* watchBulkExecuteSauceLabsCommand() {
  yield takeEvery(BULK_EXECUTE_SAUCE_LABS_COMMAND_ACTION, bulkExecuteSauceLabsCommands);
}

export function* sauceLabsSagas() {
  yield all([watchExecuteSauceLabsCommand(), watchBulkExecuteSauceLabsCommand()]);
}
