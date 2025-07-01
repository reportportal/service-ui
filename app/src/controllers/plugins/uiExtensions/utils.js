/*
 * Copyright 2024 EPAM Systems
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

import { MANIFEST_FILE_KEY, PLUGIN_TYPE_EXTENSION, PLUGIN_TYPE_REMOTE } from './constants';

export const isPluginSupportsCommonCommand = ({ enabled, details }, command) =>
  enabled && details?.commonCommands?.length && details.commonCommands.includes(command);

export const isPluginManifestAvailable = ({ enabled, details }) =>
  enabled && details?.binaryData?.[MANIFEST_FILE_KEY];

export const normalizeExtensionPluginModules = (modules, { pluginName, url, scope }) =>
  modules.map((module) => ({
    pluginName,
    url,
    pluginType: PLUGIN_TYPE_EXTENSION,
    extensionPoint: module.type,
    payload: {
      ...module,
      scope,
    },
    name: module.name,
  }));

export const normalizeRemotePluginModules = (moduleGroups, { pluginName, url }) =>
  Object.entries(moduleGroups).flatMap(([moduleType, modules]) =>
    modules.map((module) => ({
      pluginName,
      url,
      pluginType: PLUGIN_TYPE_REMOTE,
      extensionPoint: moduleType,
      payload: module,
      name: module.name,
    })),
  );
