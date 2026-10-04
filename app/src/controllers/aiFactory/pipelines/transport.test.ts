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
  AI_FACTORY_TRANSPORT_STORAGE_KEY,
  getPipelineCatalogTransport,
  isMockDownstreamCompatible,
} from './transport';

describe('pipeline catalog transport', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test.each([
    [undefined, { mode: 'mock', requestedMode: 'mock', isFallback: false }],
    [{}, { mode: 'mock', requestedMode: 'mock', isFallback: false }],
    [
      { pipelineCatalog: 'mock' },
      { mode: 'mock', requestedMode: 'mock', isFallback: false },
    ],
  ])('defaults to mock for configuration %p', (config, expected) => {
    if (config !== undefined) {
      localStorage.setItem(AI_FACTORY_TRANSPORT_STORAGE_KEY, JSON.stringify(config));
    }

    expect(getPipelineCatalogTransport()).toEqual(expected);
  });

  test.each([
    [],
    'live',
    { pipelineCatalog: true },
    { pipelineCatalog: 'unsupported' },
  ])('fails closed to mock for malformed configuration %p', (config) => {
    localStorage.setItem(AI_FACTORY_TRANSPORT_STORAGE_KEY, JSON.stringify(config));

    expect(getPipelineCatalogTransport()).toEqual({
      mode: 'mock',
      requestedMode: 'invalid',
      isFallback: true,
    });
  });

  test('fails closed to mock when stored JSON cannot be parsed', () => {
    localStorage.setItem(AI_FACTORY_TRANSPORT_STORAGE_KEY, '{invalid');

    expect(getPipelineCatalogTransport()).toEqual({
      mode: 'mock',
      requestedMode: 'invalid',
      isFallback: true,
    });
  });

  test('keeps live traffic disabled behind the hard rollout gate', () => {
    localStorage.setItem(
      AI_FACTORY_TRANSPORT_STORAGE_KEY,
      JSON.stringify({ pipelineCatalog: 'live' }),
    );

    expect(getPipelineCatalogTransport()).toEqual({
      mode: 'mock',
      requestedMode: 'live',
      isFallback: true,
    });
  });

  test('allows mock downstream endpoints only for a mock catalog', () => {
    expect(isMockDownstreamCompatible('mock')).toBe(true);
    expect(isMockDownstreamCompatible('live')).toBe(false);
  });
});
