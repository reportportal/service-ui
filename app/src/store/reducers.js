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

import { reducer as formReducer } from 'redux-form';
import { appInfoReducer } from 'controllers/appInfo';
import { authReducer } from 'controllers/auth';
import { langReducer } from 'controllers/lang';
import { modalReducer } from 'controllers/modal';
import { userReducer } from 'controllers/user';
import { projectReducer } from 'controllers/project';
import { screenLockReducer } from 'controllers/screenLock';
import { dashboardReducer } from 'controllers/dashboard';
import { launchReducer } from 'controllers/launch';
import { notificationReducer } from 'controllers/notification';
import { suiteReducer } from 'controllers/suite/reducer';
import { filterReducer } from 'controllers/filter';
import { testReducer } from 'controllers/test';
import { membersReducer } from 'controllers/members';
import { testItemReducer } from 'controllers/testItem';
import { stepReducer } from 'controllers/step';
import { itemsHistoryReducer } from 'controllers/itemsHistory';
import { logReducer } from 'controllers/log';
import { administrateReducer } from 'controllers/administrate';
import { pluginsReducer } from 'controllers/plugins';
import { initialDataReadyReducer } from 'controllers/initialData';

export default {
  appInfo: appInfoReducer,
  auth: authReducer,
  lang: langReducer,
  form: formReducer,
  modal: modalReducer,
  user: userReducer,
  project: projectReducer,
  notifications: notificationReducer,
  screenLock: screenLockReducer,
  dashboards: dashboardReducer,
  launches: launchReducer,
  suites: suiteReducer,
  filters: filterReducer,
  tests: testReducer,
  members: membersReducer,
  testItem: testItemReducer,
  step: stepReducer,
  log: logReducer,
  itemsHistory: itemsHistoryReducer,
  administrate: administrateReducer,
  plugins: pluginsReducer,
  initialDataReady: initialDataReadyReducer,
};
