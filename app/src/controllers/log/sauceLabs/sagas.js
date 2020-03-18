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
import { activeProjectSelector } from 'controllers/user';
import { fetchDataAction, createFetchPredicate } from 'controllers/fetch';
import {
  EXECUTE_SAUCE_LABS_COMMAND_ACTION,
  BULK_EXECUTE_SAUCE_LABS_COMMAND_ACTION,
  SAUCE_LABS_COMMANDS_NAMESPACES_MAP,
} from './constants';
import { updateLoadingAction } from './actionCreators';

function* executeSauceLabsCommand({ payload: { command, integrationId, data = {} } }) {
  const activeProject = yield select(activeProjectSelector);

  yield put(
    fetchDataAction(SAUCE_LABS_COMMANDS_NAMESPACES_MAP[command])(
      URLS.projectIntegrationByIdCommand(activeProject, integrationId, command),
      { data, method: 'put' },
    ),
  );
}

function* bulkExecuteSauceLabsCommands({ payload: { commands, data } }) {
  const activeIntegration = (yield select((state) =>
    availableIntegrationsByPluginNameSelector(state, SAUCE_LABS),
  ))[0];

  const { id } = activeIntegration;
  yield put(updateLoadingAction(true));

  const commandsSagas = commands.reduce(
    (acc, command) => [
      ...acc,
      call(executeSauceLabsCommand, { payload: { command, integrationId: id, data } }),
      take(createFetchPredicate(SAUCE_LABS_COMMANDS_NAMESPACES_MAP[command])),
    ],
    [],
  );
  yield all(commandsSagas);
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
