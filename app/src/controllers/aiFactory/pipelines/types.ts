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

import { Action } from 'redux';

import { IterationRS, IterationSummaryRS, PipelineComparison, PipelineRS } from 'types/aiFactory';
import {
  CLEAR_PIPELINE_COMPARISON,
  GET_PIPELINE_COMPARISON,
  GET_PIPELINE_ITERATION_DETAILS,
  GET_PIPELINE_ITERATIONS,
  GET_PIPELINES,
} from './constants';
import type { ReducedPipeline, ReducedPipelineIteration } from './liveAdapters';
import type { PipelineCatalogTransport } from './transport';

export type PipelineCatalogItem = PipelineRS | ReducedPipeline;
export type PipelineIterationItem = IterationSummaryRS | ReducedPipelineIteration;
export type IterationsByPipelineId = Record<number, PipelineIterationItem[]>;
export type IterationsLoadingByPipelineId = Record<number, boolean>;
export type IterationsErrorByPipelineId = Record<number, boolean>;

export interface PipelinesState {
  data: PipelineCatalogItem[] | null;
  isLoading?: boolean;
  transport: PipelineCatalogTransport;
  transportFallback?: boolean;
  catalogVersion: number;
  catalogRequestId: number | null;
  catalogProjectKey: string | null;
  iterationsByPipeline: IterationsByPipelineId | null;
  iterationsLoadingByPipeline: IterationsLoadingByPipelineId;
  iterationsErrorByPipeline: IterationsErrorByPipelineId;
  iterationRequestIdByPipeline: Record<number, number>;
  iterationDetails: IterationRS | null;
  iterationDetailsLoading?: boolean;
  comparison: PipelineComparison | null;
  comparisonLoading?: boolean;
  comparisonError?: boolean;
}

export interface PipelinesSelectorsRootState {
  aiFactoryPipelines?: PipelinesState;
}

export type GetPipelinesAction = Action<typeof GET_PIPELINES>;

export interface GetPipelineIterationsAction extends Action<typeof GET_PIPELINE_ITERATIONS> {
  payload: { pipelineIds: number[] };
}

export interface GetPipelineIterationDetailsAction extends Action<
  typeof GET_PIPELINE_ITERATION_DETAILS
> {
  payload: { pipelineId: number; iterationId: number };
}

export interface GetPipelineComparisonAction extends Action<typeof GET_PIPELINE_COMPARISON> {
  payload: {
    pipelineId: number;
    candidateIterationId: number;
    baselineIterationId: number;
  };
}

export type ClearPipelineComparisonAction = Action<typeof CLEAR_PIPELINE_COMPARISON>;
