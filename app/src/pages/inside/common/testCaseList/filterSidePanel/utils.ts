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

export type FilterParams = Record<string, string | string[]>;

/** Requirement values may contain commas, so the URL query keeps them one per line. */
export const REQUIREMENTS_QUERY_SEPARATOR = '\n';

/** Trims the values and drops empty values and duplicates that differ only in case. */
export const normalizeRequirements = (values: string[]): string[] => {
  const unique = new Map<string, string>();
  values.forEach((value) => {
    const trimmed = value.trim();
    if (trimmed && !unique.has(trimmed.toLowerCase())) {
      unique.set(trimmed.toLowerCase(), trimmed);
    }
  });
  return Array.from(unique.values());
};

export const parseRequirementsFromQuery = (raw?: string): string[] =>
  raw ? normalizeRequirements(raw.split(REQUIREMENTS_QUERY_SEPARATOR)) : [];

export const serializeRequirements = (values: string[]): string | undefined => {
  const normalized = normalizeRequirements(values);
  return normalized.length ? normalized.join(REQUIREMENTS_QUERY_SEPARATOR) : undefined;
};

const LINK_PREFIX = /^(https?:\/\/)?(www\.)?/i;
const LINK_START = /^(https?:\/\/|www\.)/i;

/**
 * Search terms for the requirement values. A link is searched without "http(s)://" and "www.",
 * and its last part (for example EPMRPP-116856 of .../browse/EPMRPP-116856) is searched too.
 */
export const toRequirementSearchTerms = (values: string[]): string[] =>
  normalizeRequirements(
    normalizeRequirements(values).flatMap((value) => {
      if (!LINK_START.test(value)) {
        return [value];
      }
      const withoutPrefix = value.replace(LINK_PREFIX, '').replace(/[/?#]+$/, '');
      const [path] = withoutPrefix.split(/[?#]/);
      const lastPart = path.split('/').filter(Boolean).pop() ?? '';
      return [withoutPrefix, lastPart];
    }),
  );

const buildFilterParams = (
  keys: FilterKeyMap,
  filterPriorities?: string,
  filterTags?: string,
  filterRequirements?: string,
): FilterParams => {
  const params: FilterParams = {};
  if (filterPriorities) {
    params[keys.priority] = filterPriorities.toUpperCase();
  }
  if (filterTags) {
    params[keys.attributeKey] = filterTags;
  }
  const requirementTerms = toRequirementSearchTerms(parseRequirementsFromQuery(filterRequirements));
  if (keys.requirement && requirementTerms.length) {
    params[keys.requirement] = requirementTerms;
  }
  return params;
};

export const parsePrioritiesFromQuery = (raw?: string): string[] =>
  raw ? raw.split(',').map((p) => p.toLowerCase()) : [];

export const parseTagsFromQuery = (raw?: string): string[] =>
  raw ? raw.split(',') : [];

export const buildTestCaseFilterParams = (
  filterPriorities?: string,
  filterTags?: string,
  filterRequirements?: string,
) =>
  buildFilterParams(
    TEST_CASE_FILTER_KEYS,
    normalizePrioritiesForExecutionApi(filterPriorities),
    filterTags,
    filterRequirements,
  );

export const buildFolderFilterParams = (
  filterPriorities?: string,
  filterTags?: string,
  filterRequirements?: string,
) =>
  buildFilterParams(
    FOLDER_FILTER_KEYS,
    normalizePrioritiesForExecutionApi(filterPriorities),
    filterTags,
    filterRequirements,
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
