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

export {
  GET_PIPELINES,
  PIPELINES_NAMESPACE,
  GET_PIPELINE_ITERATIONS,
  PIPELINE_ITERATIONS_NAMESPACE,
  GET_PIPELINE_ITERATION_DETAILS,
  PIPELINE_ITERATION_DETAILS_NAMESPACE,
  GET_PIPELINE_COMPARISON,
  CLEAR_PIPELINE_COMPARISON,
  PIPELINE_COMPARISON_NAMESPACE,
} from './constants';
export {
  getPipelinesAction,
  updatePipelineCiConnectionAction,
  getPipelineIterationsAction,
  getPipelineIterationDetailsAction,
  getPipelineComparisonAction,
  clearPipelineComparisonAction,
} from './actionCreators';
export { aiFactoryPipelinesSagas } from './sagas';
export { aiFactoryPipelinesReducer } from './reducer';
export {
  isCiNotConnectedError,
  isTestAutomationPipeline,
  readPipelineCiConnection,
  TEST_AUTOMATION_PIPELINE_NAME,
  type PipelineCiConnection,
  type PipelineCiConnectionState,
  type PipelineCiTarget,
} from './ciConnection';
export {
  pipelinesSelector,
  pipelineCiConnectionUpdateSelector,
  pipelineCatalogPageSelector,
  pipelineCatalogRequestSelector,
  pipelineIterationPagesSelector,
  pipelinesLoadingSelector,
  pipelineCatalogErrorSelector,
  pipelineIterationsByPipelineSelector,
  pipelineIterationsLoadingSelector,
  pipelineIterationsLoadingByPipelineSelector,
  pipelineIterationsErrorByPipelineSelector,
  pipelineCatalogTransportSelector,
  pipelineCatalogVersionSelector,
  pipelineCatalogRequestIdSelector,
  pipelineCatalogProjectKeySelector,
  pipelineIterationDetailsSelector,
  pipelineIterationDetailsLoadingSelector,
  pipelineIterationDetailsErrorSelector,
  pipelineIterationDetailsUnavailableSelector,
  pipelineIterationDetailsFailureKindSelector,
  pipelineIterationDetailProjectKeySelector,
  pipelineIterationDetailPipelineIdSelector,
  pipelineIterationDetailIterationIdSelector,
  pipelineComparisonSelector,
  pipelineComparisonLoadingSelector,
  pipelineComparisonErrorSelector,
} from './selectors';
export type {
  PipelinesState,
  PipelinesSelectorsRootState,
  GetPipelinesAction,
  GetPipelineIterationsAction,
  GetPipelineIterationDetailsAction,
  IterationsByPipelineId,
  IterationsLoadingByPipelineId,
  IterationsErrorByPipelineId,
  PipelineCatalogItem,
  PipelineCatalogPageRequest,
  PipelinePageRequest,
  PipelinePageState,
  PipelineIterationItem,
  PipelineComparisonResult,
  GetPipelineComparisonAction,
  ClearPipelineComparisonAction,
} from './types';
export type { PipelineCatalogTransport, PipelineDetailTransport } from './transport';
export type {
  ReducedPipeline,
  ReducedPipelineAttribute,
  ReducedPipelineIteration,
  ReducedPipelineIterationDetail,
  ReducedPipelineDetailStage,
  ReducedPipelineStage,
  ReducedPipelineSection,
  ReducedPipelineStatus,
} from './liveAdapters';
export type { LiveComparisonStage, LivePipelineComparison } from './liveCompareAdapter';
export {
  adaptLivePipeline,
  isReducedPipeline,
  isReducedPipelineIteration,
  isRichPipeline,
  isRichPipelineIteration,
} from './liveAdapters';
