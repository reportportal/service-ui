import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { reset } from 'redux-form';
import { select, takeEvery, call, put } from 'redux-saga/effects';
import { showNotification } from 'controllers/notification';
import { NOTIFICATION_TYPES } from 'controllers/notification/constants';
import { GENERATE_DEMO_DATA } from './constants';
import { generateDemoDataFailureAction, generateDemoDataSuccessAction } from './actionCreators';

export function* watchDemoDataGenerate() {
  yield takeEvery(GENERATE_DEMO_DATA, function* logger(action) {
    const projectID = yield select((state) => state.project.info.projectId);

    const data = {
      isCreateDashboard: 'true',
      postfix: action.payload.demoDataPostfix,
    };
    try {
      yield call(fetch, URLS.generateDemoData(projectID), { method: 'POST', data });
    } catch (e) {
      const error = (e.response && e.response.data && e.response.data.message) || e.message;
      yield put(generateDemoDataFailureAction());
      yield put(
        showNotification({
          messageId: 'failureDefault',
          type: NOTIFICATION_TYPES.ERROR,
          values: { error },
        }),
      );
      return;
    }

    yield put(reset('demoDataTabForm'));
    yield put(generateDemoDataSuccessAction());
    yield put(
      showNotification({
        messageId: 'generateDemoDataSuccess',
        type: NOTIFICATION_TYPES.SUCCESS,
      }),
    );
  });
}
