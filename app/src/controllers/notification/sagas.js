import { delay } from 'redux-saga';
import { all, call, takeEvery, put } from 'redux-saga/effects';
import {
  SHOW_NOTIFICATION,
  SHOW_DEFAULT_ERROR_NOTIFICATION,
  NOTIFICATION_TYPES,
} from './constants';
import { hideNotification, showNotification } from './actionCreators';

function* showDefaultErrorNotification({ payload: { error } }) {
  yield put(
    showNotification({
      messageId: 'failureDefault',
      type: NOTIFICATION_TYPES.ERROR,
      values: { error },
    }),
  );
}

function* watchShowDefaultErrorNotification() {
  yield takeEvery(SHOW_DEFAULT_ERROR_NOTIFICATION, showDefaultErrorNotification);
}

function* hideNotificationDelay({ payload }) {
  yield call(delay, 8000);
  yield put(hideNotification(payload.uid));
}

function* watchAddNotification() {
  yield takeEvery(SHOW_NOTIFICATION, hideNotificationDelay);
}

export function* notificationSagas() {
  yield all([watchAddNotification(), watchShowDefaultErrorNotification()]);
}
