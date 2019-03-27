import { all } from 'redux-saga/effects';
import { notificationSagas } from 'controllers/notification';
import { authSagas } from 'controllers/auth/sagas';
import { fetchSagas } from 'controllers/fetch';
import { launchSagas } from 'controllers/launch';
import { groupOperationsSagas } from 'controllers/groupOperations';
import { suiteSagas } from 'controllers/suite';
import { filterSagas } from 'controllers/filter';
import { testSagas } from 'controllers/test';
import { membersSagas } from 'controllers/members';
import { testItemsSagas } from 'controllers/testItem';
import { historySagas } from 'controllers/itemsHistory';
import { logSagas } from 'controllers/log';
import { administrateSagas } from 'controllers/administrate';
import { userSagas } from 'controllers/user';

export function* rootSagas() {
  yield all([
    notificationSagas(),
    authSagas(),
    fetchSagas(),
    launchSagas(),
    groupOperationsSagas(),
    suiteSagas(),
    filterSagas(),
    testSagas(),
    membersSagas(),
    testItemsSagas(),
    logSagas(),
    historySagas(),
    administrateSagas(),
    userSagas(),
  ]);
}
