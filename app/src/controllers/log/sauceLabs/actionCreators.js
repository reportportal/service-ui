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

import {
  EXECUTE_SAUCE_LABS_COMMAND_ACTION,
  BULK_EXECUTE_SAUCE_LABS_COMMAND_ACTION,
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

export const updateLoadingAction = (payload) => ({
  type: UPDATE_LOADING_ACTION,
  payload,
});
