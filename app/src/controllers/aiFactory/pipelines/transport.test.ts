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
  getPipelineCatalogTransport,
  getPipelineDetailTransport,
  isMockDownstreamCompatible,
} from './transport';

describe('pipeline read transport', () => {
  test.each([null, 'mock', 'postman-demo', 'live'])('always uses LP1-LP3 API with %s stored', (mode) => {
    localStorage.clear();
    if (mode) {
      localStorage.setItem('ai_factory_transport', JSON.stringify({ pipelineCatalog: mode }));
    }

    expect(getPipelineCatalogTransport()).toEqual({ mode: 'live' });
    expect(getPipelineDetailTransport('live')).toBe('live');
  });

  test('keeps mock-only downstream actions closed for a live catalog', () => {
    expect(isMockDownstreamCompatible('live')).toBe(false);
    expect(isMockDownstreamCompatible('mock')).toBe(true);
  });
});
