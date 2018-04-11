import { all } from 'redux-saga/effects';
import { watchDemoDataGenerate } from  './demoData/sagas';

export function* projectSettingsSagas() {
  yield all([watchDemoDataGenerate()]);
}
