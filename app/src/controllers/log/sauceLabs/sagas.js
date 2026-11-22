/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { takeEvery, put, call, all, select, take } from 'redux-saga/effects';
import { URLS } from 'common/urls';
import { SAUCE_LABS } from 'common/constants/pluginNames';
import { availableIntegrationsByPluginNameSelector } from 'controllers/plugins';
import { buildPluginCommandRQ, isPluginCommandForbidden } from 'controllers/plugins/utils';
import {
  fetchDataAction,
  createFetchPredicate,
  fetchErrorAction,
  handleError,
} from 'controllers/fetch';
import { FETCH_ERROR } from 'controllers/fetch/constants';
import { userRolesSelector } from 'controllers/pages';
import { canRunPluginCommands } from 'common/utils/permissions';
import { activeOrganizationIdSelector } from 'controllers/organization';
import { projectKeySelector, projectInfoIdSelector } from 'controllers/project';
import {
  EXECUTE_SAUCE_LABS_COMMAND_ACTION,
  BULK_EXECUTE_SAUCE_LABS_COMMAND_ACTION,
  SAUCE_LABS_COMMANDS_NAMESPACES_MAP,
} from './constants';
import { updateLoadingAction } from './actionCreators';

// Plugin commands need project EDITOR: viewers get no Sauce Labs data instead of 403 errors.
function* canRunCommands() {
  const userRoles = yield select(userRolesSelector);
  return canRunPluginCommands(userRoles);
}

function* executeSauceLabsCommand({ payload: { command, integrationId, data = {}, silent } }) {
  if (!(yield call(canRunCommands))) {
    return;
  }
  const projectKey = yield select(projectKeySelector);
  const projectId = yield select(projectInfoIdSelector);
  const organizationId = yield select(activeOrganizationIdSelector);

  yield put(
    fetchDataAction(SAUCE_LABS_COMMANDS_NAMESPACES_MAP[command], silent)(
      URLS.pluginsCommandsCommon(SAUCE_LABS, command),
      {
        data: buildPluginCommandRQ({
          integrationId,
          projectKey,
          projectId,
          organizationId,
          arguments: data,
        }),
        method: 'post',
      },
    ),
  );
}

function* executeSauceLabsCommandAndWait(command, integrationId, data) {
  const namespace = SAUCE_LABS_COMMANDS_NAMESPACES_MAP[command];
  const [, result] = yield all([
    call(executeSauceLabsCommand, { payload: { command, integrationId, data, silent: true } }),
    take(createFetchPredicate(namespace)),
  ]);
  // A 403 means the role is not allowed to run plugin commands: show no data, not an error.
  if (result.type === FETCH_ERROR && !isPluginCommandForbidden(result.payload)) {
    yield call(handleError, fetchErrorAction(namespace, result.payload));
  }
}

export function* bulkExecuteSauceLabsCommands({ payload: { commands, data } }) {
  if (!(yield call(canRunCommands))) {
    yield put(updateLoadingAction(false));
    return;
  }
  const activeIntegration = (yield select((state) =>
    availableIntegrationsByPluginNameSelector(state, SAUCE_LABS),
  ))[0];

  const { id } = activeIntegration;
  yield put(updateLoadingAction(true));

  yield all(commands.map((command) => call(executeSauceLabsCommandAndWait, command, id, data)));
  yield put(updateLoadingAction(false));
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
