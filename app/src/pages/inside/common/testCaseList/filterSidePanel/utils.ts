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

import {
  STATUS_TYPES,
  TEST_CASE_FILTER_KEYS,
  FOLDER_FILTER_KEYS,
  MANUAL_LAUNCH_EXECUTION_FILTER_KEYS,
  type FilterKeyMap,
} from '../constants';

const ALL_PRIORITY_VALUES = Object.values(STATUS_TYPES);

export const ensureArray = <T>(value?: T | T[] | null): T[] => {
  if (value === null || value === undefined) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
};

export const normalizeSelection = (values: string[]) => {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
};

export const toBackendPriority = (priorities: string[]): string =>
  priorities.map((priority) => priority.toUpperCase()).join(',');

export const isAllPrioritiesSelected = (priorities: string[]): boolean => {
  const uniqueNormalized = normalizeSelection(
    priorities.map((priority) => priority.toLowerCase().trim()),
  );

  if (uniqueNormalized.length !== ALL_PRIORITY_VALUES.length) {
    return false;
  }

  return ALL_PRIORITY_VALUES.every((priority) => uniqueNormalized.includes(priority));
};

const buildFilterParams = (
  keys: FilterKeyMap,
  filterPriorities?: string,
  filterTags?: string,
): Record<string, string> => {
  const params: Record<string, string> = {};
  if (filterPriorities) {
    params[keys.priority] = filterPriorities.toUpperCase();
  }
  if (filterTags) {
    params[keys.attributeKey] = filterTags;
  }
  return params;
};

export const parsePrioritiesFromQuery = (raw?: string): string[] =>
  raw ? raw.split(',').map((p) => p.toLowerCase()) : [];

export const parseTagsFromQuery = (raw?: string): string[] =>
  raw ? raw.split(',') : [];

export const buildTestCaseFilterParams = (filterPriorities?: string, filterTags?: string) =>
  buildFilterParams(
    TEST_CASE_FILTER_KEYS,
    normalizePrioritiesForExecutionApi(filterPriorities),
    filterTags,
  );

export const buildFolderFilterParams = (filterPriorities?: string, filterTags?: string) =>
  buildFilterParams(
    FOLDER_FILTER_KEYS,
    normalizePrioritiesForExecutionApi(filterPriorities),
    filterTags,
  );

export const normalizePrioritiesForExecutionApi = (filterPriorities?: string): string | undefined => {
  if (!filterPriorities?.trim()) {
    return undefined;
  }

  const parsedPriorities = filterPriorities
    .split(',')
    .map((priority) => priority.trim())
    .filter(Boolean);

  if (isAllPrioritiesSelected(parsedPriorities)) {
    return undefined;
  }

  const normalized = parsedPriorities.map((priority) => priority.toUpperCase()).join(',');

  return normalized || undefined;
};

export const buildManualLaunchExecutionFilterParams = (
  filterPriorities?: string,
  filterTags?: string,
) =>
  buildFilterParams(
    MANUAL_LAUNCH_EXECUTION_FILTER_KEYS,
    normalizePrioritiesForExecutionApi(filterPriorities),
    filterTags,
  );
