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

export type PipelineCatalogTransport = 'mock' | 'live';
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
    return config.pipelineCatalog === 'live' ? 'live' : 'invalid';
  } catch {
    return 'invalid';
  }
};

export const getPipelineCatalogTransport = (): PipelineCatalogTransportConfig => {
  const requestedMode = readRequestedMode();
  const canUseLive = requestedMode === 'live' && LIVE_PIPELINE_CATALOG_ROLLOUT_APPROVED;

  return {
    mode: canUseLive ? 'live' : 'mock',
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
  return LIVE_PIPELINE_DETAIL_ROLLOUT_APPROVED ? 'live' : 'unavailable';
};
