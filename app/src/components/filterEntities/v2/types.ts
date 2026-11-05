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

import { ElementType } from 'react';
import { FILTER_ENTITY_KIND } from 'components/filterEntities/constants';

export interface FilterEntityValue {
  value?: string;
  condition?: string;
  filteringField?: string;
}

export interface FilterEntityMeta {
  subItem?: boolean;
  longName?: string;
  subItemLabel?: string;
}

export interface FilterEntityOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface FilterEntityCustomProps {
  placeholder?: string;
  maxLength?: number;
  conditions?: string[];
  options?: FilterEntityOption[];
  multiple?: boolean;
  selectAll?: boolean;
  actionToGroup?: Record<string, string>;
  disabled?: boolean;
  error?: string;
  withoutDynamic?: boolean;
  events?: object;
  projectKey?: string;
  getURI?: (searchTerm?: string) => string;
  keyURLCreator?: (projectKey: string) => (searchTerm?: string) => string;
  valueURLCreator?: (projectKey: string, key?: string) => (searchTerm?: string) => string;
  isAttributeKeyRequired?: boolean;
  isAttributeValueRequired?: boolean;
  canAddSinglePair?: boolean;
  withValidationMessage?: boolean;
  [key: string]: unknown;
}

export type FilterEntityKind = (typeof FILTER_ENTITY_KIND)[keyof typeof FILTER_ENTITY_KIND];

export interface FilterEntity {
  id: string;
  // V2 field type. Shared catalogs also keep `component` for V1.
  // If `kind` is missing, EntityFieldV2 falls back to rendering `component`.
  kind?: FilterEntityKind;
  component?: ElementType;
  value: FilterEntityValue;
  title: string;
  validationFunc?: (entity: FilterEntityValue) => string | undefined;
  active: boolean;
  removable: boolean;
  static?: boolean;
  meta?: FilterEntityMeta;
  customProps?: FilterEntityCustomProps;
}

export interface ConditionOption {
  value: string;
  label: string;
}
