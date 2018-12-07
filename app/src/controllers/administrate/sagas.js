import { all } from 'redux-saga/effects';
import { projectSaga } from './project';

export function* administrateSaga() {
  yield all([projectSaga()]);
}
