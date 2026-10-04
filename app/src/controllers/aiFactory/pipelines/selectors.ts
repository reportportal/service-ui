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

import type { PipelinesSelectorsRootState, PipelinesState } from './types';

export const pipelinesStateSelector = (state: PipelinesSelectorsRootState): PipelinesState =>
  state.aiFactoryPipelines || {
    data: null,
    transport: 'mock',
    catalogVersion: 0,
    catalogRequestId: null,
    catalogProjectKey: null,
    iterationsByPipeline: null,
    iterationsLoadingByPipeline: {},
    iterationsErrorByPipeline: {},
    iterationRequestIdByPipeline: {},
    iterationDetails: null,
    comparison: null,
  };

export const pipelinesLoadingSelector = (state: PipelinesSelectorsRootState): boolean =>
  Boolean(pipelinesStateSelector(state).isLoading);

export const pipelinesSelector = (state: PipelinesSelectorsRootState) =>
  pipelinesStateSelector(state).data;

export const pipelineIterationsLoadingSelector = (state: PipelinesSelectorsRootState): boolean =>
  Object.values(pipelinesStateSelector(state).iterationsLoadingByPipeline).some(Boolean);

export const pipelineIterationsLoadingByPipelineSelector = (state: PipelinesSelectorsRootState) =>
  pipelinesStateSelector(state).iterationsLoadingByPipeline;

export const pipelineIterationsErrorByPipelineSelector = (state: PipelinesSelectorsRootState) =>
  pipelinesStateSelector(state).iterationsErrorByPipeline;

export const pipelineCatalogTransportSelector = (state: PipelinesSelectorsRootState) =>
  pipelinesStateSelector(state).transport;

export const pipelineCatalogTransportFallbackSelector = (
  state: PipelinesSelectorsRootState,
): boolean => Boolean(pipelinesStateSelector(state).transportFallback);

export const pipelineCatalogVersionSelector = (state: PipelinesSelectorsRootState): number =>
  pipelinesStateSelector(state).catalogVersion;

export const pipelineCatalogRequestIdSelector = (
  state: PipelinesSelectorsRootState,
): number | null => pipelinesStateSelector(state).catalogRequestId;

export const pipelineCatalogProjectKeySelector = (
  state: PipelinesSelectorsRootState,
): string | null => pipelinesStateSelector(state).catalogProjectKey;

export const pipelineIterationsByPipelineSelector = (state: PipelinesSelectorsRootState) =>
  pipelinesStateSelector(state).iterationsByPipeline;

export const pipelineIterationDetailsLoadingSelector = (
  state: PipelinesSelectorsRootState,
): boolean => Boolean(pipelinesStateSelector(state).iterationDetailsLoading);

export const pipelineIterationDetailsSelector = (state: PipelinesSelectorsRootState) =>
  pipelinesStateSelector(state).iterationDetails;

export const pipelineComparisonSelector = (state: PipelinesSelectorsRootState) =>
  pipelinesStateSelector(state).comparison;

export const pipelineComparisonLoadingSelector = (state: PipelinesSelectorsRootState): boolean =>
  Boolean(pipelinesStateSelector(state).comparisonLoading);

export const pipelineComparisonErrorSelector = (state: PipelinesSelectorsRootState): boolean =>
  Boolean(pipelinesStateSelector(state).comparisonError);
