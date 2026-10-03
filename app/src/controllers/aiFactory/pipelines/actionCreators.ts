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

import {
  CLEAR_PIPELINE_COMPARISON,
  GET_PIPELINE_COMPARISON,
  GET_PIPELINE_ITERATION_DETAILS,
  GET_PIPELINE_ITERATIONS,
  GET_PIPELINES,
} from './constants';
import {
  ClearPipelineComparisonAction,
  GetPipelineComparisonAction,
  GetPipelineIterationDetailsAction,
  GetPipelineIterationsAction,
  GetPipelinesAction,
} from './types';

export const getPipelinesAction = (): GetPipelinesAction => ({
  type: GET_PIPELINES,
});

export const getPipelineIterationsAction = (
  pipelineIds: number[],
): GetPipelineIterationsAction => ({
  type: GET_PIPELINE_ITERATIONS,
  payload: { pipelineIds },
});

export const getPipelineIterationDetailsAction = (
  pipelineId: number,
  iterationId: number,
): GetPipelineIterationDetailsAction => ({
  type: GET_PIPELINE_ITERATION_DETAILS,
  payload: { pipelineId, iterationId },
});

export const getPipelineComparisonAction = (
  pipelineId: number,
  candidateIterationId: number,
  baselineIterationId: number,
): GetPipelineComparisonAction => ({
  type: GET_PIPELINE_COMPARISON,
  payload: { pipelineId, candidateIterationId, baselineIterationId },
});

export const clearPipelineComparisonAction = (): ClearPipelineComparisonAction => ({
  type: CLEAR_PIPELINE_COMPARISON,
});
