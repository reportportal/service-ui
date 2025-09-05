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
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export interface PluginDeveloper {
  name: string;
}

export interface PluginBinaryData {
  main?: string;
  icon?: string;
  metadata?: string;
}

export interface PluginRuleField {
  name: string;
  type: string;
  label: string;
  required: boolean;
  validation?: {
    type: string;
    regex: string;
    errorMessage: string;
  };
  placeholder?: string;
}

export interface PluginMetadata {
  isIntegrationsAllowed?: boolean;
  supportedFeatures?: string[];
  embedded?: boolean;
  multiple?: boolean;
}

export interface PluginDetails {
  id: string;
  name: string;
  fileId?: string;
  version?: string;
  fileName?: string;
  metadata?: PluginMetadata;
  requires?: string;
  developer?: PluginDeveloper;
  resources?: string;
  binaryData?: PluginBinaryData;
  ruleFields?: PluginRuleField[];
  description?: string;
  commonCommands?: string[];
  allowedCommands?: string[];
  ruleDescription?: string;
  documentationLink?: string;
  documentation?: string;
  license?: string;
  dataCenters?: string[];
  maxFileSize?: number;
  acceptFileMimeTypes?: string[];
}

export interface Plugin {
  type: number;
  name: string;
  enabled: boolean;
  creationDate: string;
  pluginType: string;
  groupType: string;
  details: PluginDetails;
}
