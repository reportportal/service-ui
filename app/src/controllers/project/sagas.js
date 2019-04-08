import { takeEvery, all, put, select, call } from 'redux-saga/effects';
import { URLS } from 'common/urls';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { projectIdSelector } from 'controllers/pages';
import { fetch } from 'common/utils';

import { UPDATE_DEFECT_SUBTYPE, ADD_DEFECT_SUBTYPE } from './constants';
import { updateDefectSubTypeSuccessAction, addDefectSubTypeSuccessAction } from './actionCreators';

function* updateDefectSubType({ payload: subType }) {
  try {
    const projectId = yield select(projectIdSelector);
    const data = {
      ids: [subType],
    };
    yield call(fetch, URLS.projectDefectSubType(projectId), {
      method: 'put',
      data,
    });
    yield put(updateDefectSubTypeSuccessAction(subType));
    yield put(
      showNotification({
        messageId: 'updateDefectSubTypeSuccess',
        type: NOTIFICATION_TYPES.SUCCESS,
      }),
    );
  } catch (err) {
    const error = err.message;
    yield put(
      showNotification({
        messageId: 'updateDefectSubTypeError',
        type: NOTIFICATION_TYPES.ERROR,
        values: { error },
      }),
    );
  }
}

function* watchUpdateDefectSubType() {
  yield takeEvery(UPDATE_DEFECT_SUBTYPE, updateDefectSubType);
}

function* addDefectSubType({ payload: subType }) {
  try {
    const projectId = yield select(projectIdSelector);
    const response = yield call(fetch, URLS.projectDefectSubType(projectId), {
      method: 'post',
      data: subType,
    });
    yield put(addDefectSubTypeSuccessAction({ ...response, ...subType }));
    yield put(
      showNotification({
        messageId: 'updateDefectSubTypeSuccess',
        type: NOTIFICATION_TYPES.SUCCESS,
      }),
    );
  } catch (err) {
    const error = err.message;
    yield put(
      showNotification({
        messageId: 'updateDefectSubTypeError',
        type: NOTIFICATION_TYPES.ERROR,
        values: { error },
      }),
    );
  }
}

function* watchAddDefectSubType() {
  yield takeEvery(ADD_DEFECT_SUBTYPE, addDefectSubType);
}

export function* projectSagas() {
  yield all([watchUpdateDefectSubType(), watchAddDefectSubType()]);
}
