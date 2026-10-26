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

// `mock` remains in the type while other AI Factory features use it to guard
// mock-only actions. LP1-LP3 always select the live transport.
export type PipelineCatalogTransport = 'mock' | 'live';
export type PipelineDetailTransport = 'live';

export interface PipelineCatalogTransportConfig {
  mode: PipelineCatalogTransport;
}

export const getPipelineCatalogTransport = (): PipelineCatalogTransportConfig => ({ mode: 'live' });

export const getPipelineDetailTransport = (
  _catalogTransport: PipelineCatalogTransport,
): PipelineDetailTransport => 'live';
