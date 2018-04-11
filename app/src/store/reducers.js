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
import { projectSettingsReducer } from 'controllers/projectSettings/reducer';
import { suiteReducer } from 'controllers/suite/reducer';
import { filterReducer } from 'controllers/filter';
import { testReducer } from 'controllers/test';
import { membersReducer } from 'controllers/members';
import { testItemReducer } from 'controllers/testItem';

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
  dashboard: dashboardReducer,
  launches: launchReducer,
  suites: suiteReducer,
  filters: filterReducer,
  tests: testReducer,
  members: membersReducer,
  projectSettings: projectSettingsReducer,
  testItem: testItemReducer,
};
