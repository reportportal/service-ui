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

export const SAUCE_LABS_NAMESPACE = 'log/sauceLabs';
export const JOB_INFO_NAMESPACE = `${SAUCE_LABS_NAMESPACE}/jobInfo`;
export const SAUCE_LABS_LOGS_NAMESPACE = `${SAUCE_LABS_NAMESPACE}/logs`;
export const SAUCE_LABS_ASSETS_NAMESPACE = `${SAUCE_LABS_NAMESPACE}/assets`;
export const SAUCE_LABS_TOKEN_NAMESPACE = `${SAUCE_LABS_NAMESPACE}/token`;

export const EXECUTE_SAUCE_LABS_COMMAND_ACTION = 'executeSauceLabsCommandAction';
export const BULK_EXECUTE_SAUCE_LABS_COMMAND_ACTION = 'bulkExecuteSauceLabsCommandAction';
export const UPDATE_LOADING_ACTION = 'updateLoadingAction';

export const SAUCE_LABS_JOB_INFO_COMMAND = 'jobInfo';
export const SAUCE_LABS_LOGS_COMMAND = 'logs';
export const SAUCE_LABS_ASSETS_COMMAND = 'assets';
export const SAUCE_LABS_TEST_COMMAND = 'test';
export const SAUCE_LABS_TOKEN_COMMAND = 'token';

export const SAUCE_LABS_COMMANDS_NAMESPACES_MAP = {
  [SAUCE_LABS_JOB_INFO_COMMAND]: JOB_INFO_NAMESPACE,
  [SAUCE_LABS_LOGS_COMMAND]: SAUCE_LABS_LOGS_NAMESPACE,
  [SAUCE_LABS_ASSETS_COMMAND]: SAUCE_LABS_ASSETS_NAMESPACE,
  [SAUCE_LABS_TOKEN_COMMAND]: SAUCE_LABS_TOKEN_NAMESPACE,
};
