import { take, put, race } from 'redux-saga/effects';
import { showModalAction, hideModalAction } from './actionCreators';
import { HIDE_MODAL, CONFIRM_MODAL } from './constants';

export function* confirmSaga(confirmationModalOptions) {
  yield put(showModalAction(confirmationModalOptions));
  const { confirmed } = yield race({
    confirmed: take(CONFIRM_MODAL),
    cancelled: take(HIDE_MODAL),
  });
  if (confirmed) {
    yield put(hideModalAction());
  }
  return !!confirmed;
}
