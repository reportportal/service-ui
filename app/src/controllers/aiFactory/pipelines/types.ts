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

import { IterationRS, IterationSummaryRS, PipelineRS } from 'types/aiFactory';
import { GET_PIPELINE_ITERATION_DETAILS, GET_PIPELINE_ITERATIONS, GET_PIPELINES } from './constants';

/** Iterations of every currently loaded pipeline, keyed by pipeline id. */
export type IterationsByPipelineId = Record<number, IterationSummaryRS[]>;

export interface PipelinesState {
  data: PipelineRS[] | null;
  isLoading?: boolean;
  iterationsByPipeline: IterationsByPipelineId | null;
  iterationsLoading?: boolean;
  iterationDetails: IterationRS | null;
  iterationDetailsLoading?: boolean;
}

export interface PipelinesSelectorsRootState {
  aiFactoryPipelines?: PipelinesState;
}

export type GetPipelinesAction = Action<typeof GET_PIPELINES>;

export interface GetPipelineIterationsAction extends Action<typeof GET_PIPELINE_ITERATIONS> {
  payload: { pipelineIds: number[] };
}

export interface GetPipelineIterationDetailsAction
  extends Action<typeof GET_PIPELINE_ITERATION_DETAILS> {
  payload: { pipelineId: number; iterationId: number };
}
