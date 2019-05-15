import { all, takeEvery, put } from 'redux-saga/effects';
import { URLS } from 'common/urls';
import { fetchDataAction } from 'controllers/fetch';
import {
  FETCH_PLUGINS,
  FETCH_GLOBAL_INTEGRATIONS,
  NAMESPACE,
  GLOBAL_INTEGRATIONS_NAMESPACE,
} from './constants';

function* fetchGlobalIntegrations() {
  yield put(fetchDataAction(GLOBAL_INTEGRATIONS_NAMESPACE)(URLS.globalIntegrationsByPluginName()));
}

function* watchFetchGlobalIntegrations() {
  yield takeEvery(FETCH_GLOBAL_INTEGRATIONS, fetchGlobalIntegrations);
}

function* fetchPlugins() {
  yield put(fetchDataAction(NAMESPACE)(URLS.plugin()));
}

function* watchFetchPlugins() {
  yield takeEvery(FETCH_PLUGINS, fetchPlugins);
}

export function* pluginsSagas() {
  yield all([watchFetchPlugins(), watchFetchGlobalIntegrations()]);
}
