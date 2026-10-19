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

import { getStorageItem } from 'common/utils/storageUtils';

export const AI_FACTORY_TRANSPORT_STORAGE_KEY = 'ai_factory_transport';

export type PipelineCatalogTransport = 'mock' | 'live' | 'postman-demo';
export type PipelineDetailTransport = PipelineCatalogTransport | 'unavailable';
type RequestedPipelineCatalogTransport = PipelineCatalogTransport | 'invalid';

interface AiFactoryTransportConfig {
  pipelineCatalog?: unknown;
}

export interface PipelineCatalogTransportConfig {
  mode: PipelineCatalogTransport;
  requestedMode: RequestedPipelineCatalogTransport;
  isFallback: boolean;
}

const LIVE_PIPELINE_CATALOG_ROLLOUT_APPROVED = false;
const LIVE_PIPELINE_DETAIL_ROLLOUT_APPROVED = false;

const readRequestedMode = (): RequestedPipelineCatalogTransport => {
  try {
    const storedConfig = getStorageItem(AI_FACTORY_TRANSPORT_STORAGE_KEY) as unknown;
    if (storedConfig === null) {
      return 'mock';
    }
    if (typeof storedConfig !== 'object' || Array.isArray(storedConfig)) {
      return 'invalid';
    }
    const config = storedConfig as AiFactoryTransportConfig;

    if (config.pipelineCatalog === undefined || config.pipelineCatalog === 'mock') {
      return 'mock';
    }
    if (config.pipelineCatalog === 'live' || config.pipelineCatalog === 'postman-demo') {
      return config.pipelineCatalog;
    }
    return 'invalid';
  } catch {
    return 'invalid';
  }
};

export const getPipelineCatalogTransport = (): PipelineCatalogTransportConfig => {
  const requestedMode = readRequestedMode();
  const canUseLive = requestedMode === 'live' && LIVE_PIPELINE_CATALOG_ROLLOUT_APPROVED;
  let mode: PipelineCatalogTransport = 'mock';
  if (requestedMode === 'postman-demo') {
    mode = 'postman-demo';
  } else if (canUseLive) {
    mode = 'live';
  }

  return {
    mode,
    requestedMode,
    isFallback: requestedMode === 'invalid' || (requestedMode === 'live' && !canUseLive),
  };
};

export const isMockDownstreamCompatible = (mode: PipelineCatalogTransport): boolean =>
  mode === 'mock';

export const getPipelineDetailTransport = (
  catalogTransport: PipelineCatalogTransport,
): PipelineDetailTransport => {
  if (catalogTransport === 'mock') {
    return 'mock';
  }
  if (catalogTransport === 'postman-demo') {
    return 'postman-demo';
  }
  // The explicit demo mode may inspect a non-empty live catalog and its read-only LP3 detail.
  // Keep the normal live rollout gate independent until the deployment checks are complete.
  if (catalogTransport === 'live' && readRequestedMode() === 'postman-demo') {
    return 'live';
  }
  return LIVE_PIPELINE_DETAIL_ROLLOUT_APPROVED ? 'live' : 'unavailable';
};
