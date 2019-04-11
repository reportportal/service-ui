import { takeEvery, all, put, select, call } from 'redux-saga/effects';
import { URLS } from 'common/urls';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { projectIdSelector } from 'controllers/pages';
import { fetch } from 'common/utils';

import { UPDATE_DEFECT_SUBTYPE, ADD_DEFECT_SUBTYPE, DELETE_DEFECT_SUBTYPE } from './constants';
import {
  updateDefectSubTypeSuccessAction,
  addDefectSubTypeSuccessAction,
  deleteDefectSubTypeSuccessAction,
} from './actionCreators';

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
  } catch ({ message }) {
    yield put(
      showNotification({
        messageId: 'changeDefectSubTypeError',
        type: NOTIFICATION_TYPES.ERROR,
        values: { message },
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
  } catch ({ message }) {
    yield put(
      showNotification({
        messageId: 'changeDefectSubTypeError',
        type: NOTIFICATION_TYPES.ERROR,
        values: { message },
      }),
    );
  }
}

function* watchAddDefectSubType() {
  yield takeEvery(ADD_DEFECT_SUBTYPE, addDefectSubType);
}

function* deleteDefectSubType({ payload: subType }) {
  try {
    const projectId = yield select(projectIdSelector);
    yield call(fetch, URLS.projectDeleteDefectSubType(projectId, subType.id), {
      method: 'delete',
    });
    yield put(deleteDefectSubTypeSuccessAction(subType));
    yield put(
      showNotification({
        messageId: 'deleteDefectSubTypeSuccess',
        type: NOTIFICATION_TYPES.SUCCESS,
      }),
    );
  } catch ({ message }) {
    yield put(
      showNotification({
        messageId: 'changeDefectSubTypeError',
        type: NOTIFICATION_TYPES.ERROR,
        values: { message },
      }),
    );
  }
}

function* watchDeleteDefectSubType() {
  yield takeEvery(DELETE_DEFECT_SUBTYPE, deleteDefectSubType);
}

export function* projectSagas() {
  yield all([watchUpdateDefectSubType(), watchAddDefectSubType(), watchDeleteDefectSubType()]);
}
