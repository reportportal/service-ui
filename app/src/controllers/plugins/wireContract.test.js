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

import marker from './__fixtures__/contract-marker.json';
import installRequest from './__fixtures__/install-request.json';
import licenceRequest from './__fixtures__/licence-request.json';

/**
 * The SHA-256 service-api computes over the field paths of every route these fixtures cover.
 * Bump it in the same commit that regenerates them, having read what changed — the whole point
 * is that a wire change is a reviewed diff here and not a fixture that moves silently.
 *
 * A mismatch is one of two things, both real: the fixtures were regenerated from a service-api
 * whose wire shape changed, or they were never regenerated after it changed and now describe a
 * service that no longer exists. `__fixtures__/README.md` says how to regenerate them.
 */
const CONTRACT_HASH = '74cb316e28f6344062ac99cd40d40de8dd141e4ce26c044b786dc11654bd43a8';

const INSTALL_ROUTE = 'POST /v1/plugins/{registryId}/install';
const LICENCE_ROUTE = 'PUT /v1/plugins/licence';

describe('the checked-in marketplace fixtures', () => {
  test('are the shapes service-api publishes today', () => {
    expect(marker.contractHash).toBe(CONTRACT_HASH);
  });

  // without this the hash is a constant compared against itself: these tie it to the bodies the
  // sagas are tested against, so a marker that moved has to be reconciled with a real request
  test('cover the install body the UI sends', () => {
    expect(Object.keys(installRequest)).toEqual(marker.routes[INSTALL_ROUTE]);
  });

  test('cover the licence body the UI sends', () => {
    expect(Object.keys(licenceRequest)).toEqual(marker.routes[LICENCE_ROUTE]);
  });
});
