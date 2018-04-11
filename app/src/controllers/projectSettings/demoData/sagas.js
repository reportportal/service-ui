import { fetch } from 'common/utils';
import { URLS } from 'common/urls';
import { reset } from 'redux-form';
import { select, takeEvery, call, put } from 'redux-saga/effects';
import { GENERATE_DEMO_DATA } from './constants';
import {NOTIFICATION_TYPES} from "../../notification/constants";
import {showNotification} from "../../notification";
import {generateDemoDataFailureAction, generateDemoDataSuccessAction} from "./actionCreators";


export function* watchDemoDataGenerate() {
  yield takeEvery(GENERATE_DEMO_DATA, function* logger(action) {
    const projectID = yield select((state) => state.project.info.projectId)
    console.log('project id!!', projectID);

    const data = {
      isCreateDashboard: "true",
      postfix: action.payload.postfix
    };
    try {
      yield call(fetch, URLS.generateDemoData(projectID), {method: 'POST', data});
    } catch (e) {
      console.log('status', e.response.status);
      const error = (e.response && e.response.data && e.response.data.message) || e.message;
      yield put(
        showNotification({
          messageId: 'failureDefault',
          type: NOTIFICATION_TYPES.ERROR,
          values: { error },
        }),
      );

      yield put(generateDemoDataFailureAction());
      return;
    }

    yield put(generateDemoDataSuccessAction());
    yield put(reset('demoDataGeneratorForm'));
    yield put(showNotification({
      messageId: 'generateDemoDataSuccess',
      type: NOTIFICATION_TYPES.SUCCESS,
    }))
  })
}
