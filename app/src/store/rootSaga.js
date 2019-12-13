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

import { all, spawn, call } from 'redux-saga/effects';
import { notificationSagas } from 'controllers/notification';
import { authSagas } from 'controllers/auth/sagas';
import { fetchSagas } from 'controllers/fetch';
import { launchSagas } from 'controllers/launch';
import { groupOperationsSagas } from 'controllers/groupOperations';
import { suiteSagas } from 'controllers/suite';
import { dashboardSagas } from 'controllers/dashboard';
import { filterSagas } from 'controllers/filter';
import { testSagas } from 'controllers/test';
import { membersSagas } from 'controllers/members';
import { testItemsSagas } from 'controllers/testItem';
import { historySagas } from 'controllers/itemsHistory';
import { logSagas } from 'controllers/log';
import { administrateSagas } from 'controllers/administrate';
import { userSagas } from 'controllers/user';
import { projectSagas } from 'controllers/project';
import { initialDataSagas } from 'controllers/initialData';
import { pageSagas } from 'controllers/pages';
import { pluginSagas } from 'controllers/plugins';

const sagas = [
  notificationSagas,
  authSagas,
  fetchSagas,
  launchSagas,
  groupOperationsSagas,
  suiteSagas,
  dashboardSagas,
  filterSagas,
  testSagas,
  membersSagas,
  testItemsSagas,
  logSagas,
  historySagas,
  administrateSagas,
  userSagas,
  projectSagas,
  initialDataSagas,
  pageSagas,
  pluginSagas,
];

export function* rootSagas() {
  yield all(
    sagas.map((saga) =>
      // eslint-disable-next-line func-names
      spawn(function*() {
        // eslint-disable-next-line no-constant-condition
        while (true) {
          try {
            yield call(saga);
            break;
          } catch (e) {
            console.error(e); // eslint-disable-line no-console
          }
        }
      }),
    ),
  );
}
