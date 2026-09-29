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
  state.aiFactoryPipelines || { data: null, iterationsByPipeline: null, iterationDetails: null };

export const pipelinesLoadingSelector = (state: PipelinesSelectorsRootState): boolean =>
  Boolean(pipelinesStateSelector(state).isLoading);

export const pipelinesSelector = (state: PipelinesSelectorsRootState) =>
  pipelinesStateSelector(state).data;

export const pipelineIterationsLoadingSelector = (state: PipelinesSelectorsRootState): boolean =>
  Boolean(pipelinesStateSelector(state).iterationsLoading);

export const pipelineIterationsByPipelineSelector = (state: PipelinesSelectorsRootState) =>
  pipelinesStateSelector(state).iterationsByPipeline;

export const pipelineIterationDetailsLoadingSelector = (
  state: PipelinesSelectorsRootState,
): boolean => Boolean(pipelinesStateSelector(state).iterationDetailsLoading);

export const pipelineIterationDetailsSelector = (state: PipelinesSelectorsRootState) =>
  pipelinesStateSelector(state).iterationDetails;
