import { take, put, race } from 'redux-saga/effects';
import { showModalAction } from './actionCreators';
import { HIDE_MODAL, CONFIRM_MODAL } from './constants';

export function* confirmSaga(confirmationModalOptions) {
  yield put(showModalAction(confirmationModalOptions));
  const { confirmed } = yield race({
    confirmed: take(CONFIRM_MODAL),
    cancelled: take(HIDE_MODAL),
  });
  return !!confirmed;
}
