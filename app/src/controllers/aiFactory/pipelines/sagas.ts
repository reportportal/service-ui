/*
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { call, select, all, put, takeEvery, takeLatest } from 'redux-saga/effects';

import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { fetchSuccessAction, fetchErrorAction } from 'controllers/fetch';
import { FETCH_START } from 'controllers/fetch/constants';
import { showErrorNotification } from 'controllers/notification';
import { projectKeySelector } from 'controllers/project';
import { LOGOUT } from 'controllers/auth';
import { IterationPageRS, PipelineRS } from 'types/aiFactory';

import {
  GET_PIPELINE_ITERATIONS,
  GET_PIPELINES,
  PIPELINE_ITERATIONS_NAMESPACE,
  PIPELINES_NAMESPACE,
} from './constants';
import { GetPipelineIterationsAction } from './types';

let abortController: AbortController | undefined;
let iterationsAbortController: AbortController | undefined;

function* getPipelines(): Generator {
  const controller = new AbortController();
  abortController?.abort();
  abortController = controller;

  try {
    const projectKey = (yield select(projectKeySelector)) as string;

    yield put({
      type: FETCH_START,
      payload: { projectKey },
      meta: { namespace: PIPELINES_NAMESPACE },
    });

    const data = (yield call(fetch, URLS.tmsPipeline(projectKey), {
      signal: controller.signal,
    })) as PipelineRS[];

    yield put(
      fetchSuccessAction(PIPELINES_NAMESPACE, {
        data,
      }),
    );
  } catch (error) {
    const isCancellation = error instanceof Error && error.message === 'REQUEST_CANCELED';

    if (!isCancellation) {
      yield put(fetchErrorAction(PIPELINES_NAMESPACE, error));
      yield put(
        showErrorNotification({
          messageId: 'aiFactoryPipelinesLoadingFailed',
        }),
      );
    }
  }
}

function handleLogoutDuringPipelinesFetch(): void {
  const controller = abortController;
  abortController = undefined;
  controller?.abort();
}

function* watchGetPipelines() {
  yield takeLatest(GET_PIPELINES, getPipelines);
  yield takeEvery(LOGOUT, handleLogoutDuringPipelinesFetch);
}

function* getPipelineIterations(action: GetPipelineIterationsAction): Generator {
  const controller = new AbortController();
  iterationsAbortController?.abort();
  iterationsAbortController = controller;

  try {
    const projectKey = (yield select(projectKeySelector)) as string;
    const { pipelineIds } = action.payload;

    yield put({
      type: FETCH_START,
      payload: { projectKey },
      meta: { namespace: PIPELINE_ITERATIONS_NAMESPACE },
    });

    const pages = (yield all(
      pipelineIds.map((pipelineId) =>
        call(fetch, URLS.tmsPipelineIterations(projectKey, pipelineId), {
          signal: controller.signal,
        }),
      ),
    )) as IterationPageRS[];

    const byPipelineId = pipelineIds.reduce<Record<number, IterationPageRS['content']>>(
      (acc, pipelineId, index) => {
        acc[pipelineId] = pages[index].content;
        return acc;
      },
      {},
    );

    yield put(
      fetchSuccessAction(PIPELINE_ITERATIONS_NAMESPACE, {
        data: byPipelineId,
      }),
    );
  } catch (error) {
    const isCancellation = error instanceof Error && error.message === 'REQUEST_CANCELED';

    if (!isCancellation) {
      yield put(fetchErrorAction(PIPELINE_ITERATIONS_NAMESPACE, error));
      yield put(
        showErrorNotification({
          messageId: 'aiFactoryPipelinesLoadingFailed',
        }),
      );
    }
  }
}

function handleLogoutDuringIterationsFetch(): void {
  const controller = iterationsAbortController;
  iterationsAbortController = undefined;
  controller?.abort();
}

function* watchGetPipelineIterations() {
  yield takeLatest(GET_PIPELINE_ITERATIONS, getPipelineIterations);
  yield takeEvery(LOGOUT, handleLogoutDuringIterationsFetch);
}

export function* aiFactoryPipelinesSagas() {
  yield all([watchGetPipelines(), watchGetPipelineIterations()]);
}
