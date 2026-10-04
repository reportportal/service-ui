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

import { PipelineRS, PipelineType } from 'types/aiFactory';

import {
  getPipelineSettingsProvenance,
  matchesPipelineSettingsProvenance,
  PipelineSettingsState,
} from './pipelineSettingsProvenance';

const pipeline: PipelineRS = {
  id: 1,
  type: PipelineType.GENERATION,
  name: 'Generation',
  repository: 'repo',
  iterationsCount: 1,
  settings: { autoReady: true, threshold: 90, editable: true },
};

const createState = (
  projectKey: string,
  currentPipeline: PipelineRS,
  catalogVersion = 5,
  catalogRequestId = 8,
): PipelineSettingsState => ({
  project: { info: { projectKey } },
  aiFactoryPipelines: {
    data: [currentPipeline],
    transport: 'mock',
    catalogVersion,
    catalogRequestId,
    catalogProjectKey: projectKey,
    iterationsByPipeline: null,
    iterationsLoadingByPipeline: {},
    iterationsErrorByPipeline: {},
    iterationRequestIdByPipeline: {},
    iterationDetails: null,
    comparison: null,
  },
});

describe('pipeline settings provenance', () => {
  test('captures and matches the exact project, catalog request, and pipeline entity', () => {
    const state = createState('project_a', pipeline);
    const provenance = getPipelineSettingsProvenance(state, pipeline);

    expect(provenance).toEqual({
      projectKey: 'project_a',
      catalogTransport: 'mock',
      catalogVersion: 5,
      catalogRequestId: 8,
    });
    expect(matchesPipelineSettingsProvenance(state, pipeline, provenance ?? undefined)).toBe(true);
  });

  test.each([
    ['same version and request id in another project', createState('project_b', { ...pipeline })],
    ['another catalog request', createState('project_a', pipeline, 5, 9)],
    ['another pipeline entity instance', createState('project_a', { ...pipeline })],
  ])('rejects opening provenance after %s', (_description, currentState) => {
    const openingState = createState('project_a', pipeline);
    const provenance = getPipelineSettingsProvenance(openingState, pipeline);

    expect(
      matchesPipelineSettingsProvenance(currentState, pipeline, provenance ?? undefined),
    ).toBe(false);
  });

  test('does not create provenance for unresolved, live, or project-mismatched catalogs', () => {
    const unresolved = createState('project_a', pipeline, 0, 8);
    const live = createState('project_a', pipeline);
    if (live.aiFactoryPipelines) live.aiFactoryPipelines.transport = 'live';
    const mismatchedProject = createState('project_a', pipeline);
    if (mismatchedProject.aiFactoryPipelines) {
      mismatchedProject.aiFactoryPipelines.catalogProjectKey = 'project_b';
    }

    expect(getPipelineSettingsProvenance(unresolved, pipeline)).toBeNull();
    expect(getPipelineSettingsProvenance(live, pipeline)).toBeNull();
    expect(getPipelineSettingsProvenance(mismatchedProject, pipeline)).toBeNull();
  });
});
