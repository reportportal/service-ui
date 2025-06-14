/*
 * Copyright 2019 EPAM Systems
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

import { PLUGIN_TYPE_REMOTE } from 'controllers/plugins/uiExtensions/constants';
import { PLUGINS_SUPPORTS_MULTIPLE_INSTANCES, BUILTIN_PLUGINS } from './constants';

export const isIntegrationSupportsMultipleInstances = (instanceType) =>
  PLUGINS_SUPPORTS_MULTIPLE_INSTANCES.indexOf(instanceType) !== -1;

export const isPluginBuiltin = (instanceType) => BUILTIN_PLUGINS.indexOf(instanceType) !== -1;

export const arePluginIntegrationsAllowed = (pluginType, metadata) => {
  if (pluginType === PLUGIN_TYPE_REMOTE) {
    return false;
  }

  return metadata && metadata.isIntegrationsAllowed !== undefined
    ? metadata.isIntegrationsAllowed
    : true;
};
