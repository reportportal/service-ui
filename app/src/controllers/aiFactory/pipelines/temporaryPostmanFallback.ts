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

import type {
  ReducedPipeline,
  ReducedPipelineIteration,
  ReducedPipelineIterationDetail,
} from './liveAdapters';

// TEMPORARY: derived from the request bodies in Report Portal Pipelines.postman_collection.json.
// The collection has no saved GET responses. IDs and the final iteration status are demo values.
// Remove this file and the 'postman-demo' branches in transport.ts/sagas.ts after live LP1-LP3 is ready.
const DEMO_PIPELINE_ID = 1;
const DEMO_ITERATION_ID = 101;
const startedAt = Date.parse('2026-09-19T10:13:00Z');
const finishedAt = Date.parse('2026-09-19T10:22:40Z');

const pipeline: ReducedPipeline = {
  kind: 'reduced',
  id: DEMO_PIPELINE_ID,
  name: 'Test case generation',
  type: 'TEST_CASE_GENERATION',
  repository: 'EPM-RPP/rp-tests',
  iterationsCount: 1,
  autoReady: { enabled: true, threshold: 90 },
};

const iteration: ReducedPipelineIteration = {
  kind: 'reduced',
  id: DEMO_ITERATION_ID,
  pipelineId: DEMO_PIPELINE_ID,
  number: 1,
  status: 'NEEDS_HUMAN',
  trigger: 'Web form · REQUIREMENT',
  startedAt,
  finishedAt,
  durationMs: finishedAt - startedAt,
  attributes: [
    { key: 'requirement', value: 'US-TMS-MIG-001' },
    { key: 'model', value: 'auto (default)' },
    { key: 'env', value: 'beta5' },
    { key: 'spec', value: 'US-TMS-MIG-001' },
    { key: 'jira', value: 'EPMRPP-104212' },
    { key: 'ci', value: '#1284551' },
    { key: 'folder', value: 'tms/library/emptystate/iteration-1' },
    { key: 'suiteScore', value: '79' },
  ],
  stages: [
    { key: 'create', label: 'Create', sequence: 1, status: 'PASSED' },
    { key: 'grade', label: 'Grade', sequence: 2, status: 'PASSED' },
    { key: 'upload', label: 'Upload', sequence: 3, status: 'PASSED' },
    { key: 'review', label: 'Review', sequence: 4, status: 'NEEDS_HUMAN' },
  ],
};

const detail: ReducedPipelineIterationDetail = {
  ...iteration,
  pipelineName: pipeline.name,
  stages: iteration.stages.map((stage, index) => ({ ...stage, id: index + 1, sequence: index + 1 })),
};

export const isEmptySuccessfulPipelineCatalog = (status: number, value: unknown): boolean => {
  if (status !== 200 || typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  const { content, page } = value as Record<string, unknown>;
  if (!Array.isArray(content) || content.length !== 0 || !page || typeof page !== 'object') {
    return false;
  }
  const pagination = page as Record<string, unknown>;
  return (
    pagination.number === 1 &&
    typeof pagination.size === 'number' &&
    Number.isSafeInteger(pagination.size) &&
    pagination.size > 0 &&
    pagination.totalElements === 0 &&
    pagination.totalPages === 0 &&
    (pagination.hasNext === undefined || pagination.hasNext === false)
  );
};

export const getPostmanDemoPipelines = (): ReducedPipeline[] => [pipeline];

export const getPostmanDemoIterations = (pipelineId: number): ReducedPipelineIteration[] =>
  pipelineId === DEMO_PIPELINE_ID ? [iteration] : [];

export const getPostmanDemoDetail = (
  pipelineId: number,
  iterationId: number,
): ReducedPipelineIterationDetail => {
  if (pipelineId !== DEMO_PIPELINE_ID || iterationId !== DEMO_ITERATION_ID) {
    throw new Error('Unknown temporary Postman iteration');
  }
  return detail;
};
