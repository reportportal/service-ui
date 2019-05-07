import { select, take } from 'redux-saga/effects';

export function* waitForSelector(selector) {
  if (yield select(selector)) return;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    yield take('*');
    if (yield select(selector)) return;
  }
}
