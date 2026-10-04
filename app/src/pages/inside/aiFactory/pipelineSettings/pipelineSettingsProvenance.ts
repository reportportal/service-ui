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
  type PipelineCatalogTransport,
  type PipelinesSelectorsRootState,
  pipelineCatalogProjectKeySelector,
  pipelineCatalogRequestIdSelector,
  pipelineCatalogTransportSelector,
  pipelineCatalogVersionSelector,
  pipelinesSelector,
} from 'controllers/aiFactory/pipelines';
import { projectKeySelector } from 'controllers/project';
import type { PipelineRS } from 'types/aiFactory';

export interface PipelineSettingsCatalogProvenance {
  projectKey: string;
  catalogTransport: PipelineCatalogTransport;
  catalogVersion: number;
  catalogRequestId: number;
}

export interface PipelineSettingsState extends PipelinesSelectorsRootState {
  project?: {
    info?: {
      projectKey: string;
    };
  };
}

export const getPipelineSettingsProvenance = (
  state: PipelineSettingsState,
  pipeline: PipelineRS,
): PipelineSettingsCatalogProvenance | null => {
  const projectKey = projectKeySelector(state);
  const catalogTransport = pipelineCatalogTransportSelector(state);
  const catalogVersion = pipelineCatalogVersionSelector(state);
  const catalogRequestId = pipelineCatalogRequestIdSelector(state);
  const catalogProjectKey = pipelineCatalogProjectKeySelector(state);
  const currentPipeline = pipelinesSelector(state)?.find(({ id }) => id === pipeline.id);

  if (
    catalogTransport !== 'mock' ||
    catalogVersion <= 0 ||
    catalogRequestId === null ||
    catalogProjectKey !== projectKey ||
    currentPipeline !== pipeline
  ) {
    return null;
  }

  return { projectKey, catalogTransport, catalogVersion, catalogRequestId };
};

export const matchesPipelineSettingsProvenance = (
  state: PipelineSettingsState,
  pipeline: PipelineRS,
  openingProvenance?: PipelineSettingsCatalogProvenance,
): boolean => {
  const currentProvenance = getPipelineSettingsProvenance(state, pipeline);

  return Boolean(
    currentProvenance &&
      openingProvenance &&
      currentProvenance.projectKey === openingProvenance.projectKey &&
      currentProvenance.catalogTransport === openingProvenance.catalogTransport &&
      currentProvenance.catalogVersion === openingProvenance.catalogVersion &&
      currentProvenance.catalogRequestId === openingProvenance.catalogRequestId,
  );
};
