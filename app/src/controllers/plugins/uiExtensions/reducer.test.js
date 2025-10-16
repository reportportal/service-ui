/*
 * Copyright 2025 EPAM Systems
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
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { uiExtensionsReducer } from './reducer';
import { updateExtensionManifestAction } from './actions';

describe('uiExtensionsReducer - UPDATE_EXTENSION_MANIFEST upsert', () => {
  it('replaces existing manifest by pluginName', () => {
    const initialState = {
      extensionManifests: [
        { pluginName: 'plugin-a', url: 'http://old', scope: 'scope-a', extensions: [] },
      ],
    };

    const updatedManifest = {
      pluginName: 'plugin-a',
      url: 'http://new',
      scope: 'scope-a',
      extensions: [{ name: 'ext', type: 'uiExtension:projectPage' }],
    };

    const state = uiExtensionsReducer(initialState, updateExtensionManifestAction(updatedManifest));

    expect(state.extensionManifests).toHaveLength(1);
    expect(state.extensionManifests[0]).toEqual(updatedManifest);
  });

  it('appends a new manifest when pluginName not found', () => {
    const initialState = { extensionManifests: [] };

    const newManifest = {
      pluginName: 'plugin-b',
      url: 'http://new',
      scope: 'scope-b',
      extensions: [{ name: 'page', type: 'uiExtension:projectPage' }],
    };

    const state = uiExtensionsReducer(initialState, updateExtensionManifestAction(newManifest));

    expect(state.extensionManifests).toHaveLength(1);
    expect(state.extensionManifests[0]).toEqual(newManifest);
  });
});
