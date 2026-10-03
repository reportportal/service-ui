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

import { fetchErrorAction, fetchSuccessAction } from 'controllers/fetch';
import { FETCH_START } from 'controllers/fetch/constants';
import { PipelineComparison } from 'types/aiFactory';

import { getPipelineComparisonAction, clearPipelineComparisonAction } from './actionCreators';
import { PIPELINE_COMPARISON_NAMESPACE } from './constants';
import { aiFactoryPipelinesReducer } from './reducer';
import type { PipelinesState } from './types';

const comparison: PipelineComparison = {
  mode: 'status-only',
  pipelineId: 1,
  candidate: { id: 102, number: 2, status: 'COMPLETED' },
  baseline: { id: 101, number: 1, status: 'IN_REVIEW' },
  hasDifferentRequirements: false,
  stages: [],
};

describe('aiFactoryPipelinesReducer comparison state', () => {
  test('clears a stale comparison immediately when another comparison is requested', () => {
    const loaded = aiFactoryPipelinesReducer(
      undefined,
      fetchSuccessAction(PIPELINE_COMPARISON_NAMESPACE, { data: comparison }),
    );

    const requested = aiFactoryPipelinesReducer(
      loaded,
      getPipelineComparisonAction(1, 103, 102),
    ) as PipelinesState;

    expect(requested.comparison).toBeNull();
    expect(requested.comparisonError).toBe(false);
  });

  test('tracks loading, success, and error independently for the comparison namespace', () => {
    const loading = aiFactoryPipelinesReducer(undefined, {
      type: FETCH_START,
      meta: { namespace: PIPELINE_COMPARISON_NAMESPACE },
    });
    expect(loading).toMatchObject({
      comparison: null,
      comparisonLoading: true,
      comparisonError: false,
    });

    const loaded = aiFactoryPipelinesReducer(
      loading,
      fetchSuccessAction(PIPELINE_COMPARISON_NAMESPACE, { data: comparison }),
    );
    expect(loaded).toMatchObject({
      comparison,
      comparisonLoading: false,
      comparisonError: false,
    });

    const failed = aiFactoryPipelinesReducer(
      loaded,
      fetchErrorAction(PIPELINE_COMPARISON_NAMESPACE, new Error('failed')),
    );
    expect(failed).toMatchObject({
      comparison: null,
      comparisonLoading: false,
      comparisonError: true,
    });
  });

  test('clears comparison data, loading, and error state explicitly', () => {
    const failedWhileLoading = {
      ...aiFactoryPipelinesReducer(undefined, { type: 'unrelated' }),
      comparison,
      comparisonLoading: true,
      comparisonError: true,
    };

    expect(
      aiFactoryPipelinesReducer(failedWhileLoading, clearPipelineComparisonAction()),
    ).toMatchObject({
      comparison: null,
      comparisonLoading: false,
      comparisonError: false,
    });
  });

  test('ignores fetch results from other namespaces', () => {
    const current = {
      ...aiFactoryPipelinesReducer(undefined, { type: 'unrelated' }),
      comparison,
      comparisonLoading: true,
      comparisonError: true,
    };

    expect(
      aiFactoryPipelinesReducer(current, fetchSuccessAction('anotherNamespace', { data: null })),
    ).toMatchObject({
      comparison,
      comparisonLoading: true,
      comparisonError: true,
    });
  });
});
