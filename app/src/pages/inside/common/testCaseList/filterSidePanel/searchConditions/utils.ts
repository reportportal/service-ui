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

export const SEARCH_FIELDS = [
  'name',
  'description',
  'precondition',
  'instructions',
  'expectedResult',
] as const;

export type SearchField = (typeof SEARCH_FIELDS)[number];

/** One condition of the Search block: where to search and the text to find. */
export interface SearchCondition {
  field: SearchField;
  value: string;
}

/** Fields searched in the steps or the scenario text; they use a text area. */
export const MULTILINE_SEARCH_FIELDS: readonly SearchField[] = ['instructions', 'expectedResult'];

const TEST_CASE_SEARCH_KEYS: Record<SearchField, string> = {
  name: 'filter.cnt.name',
  description: 'filter.cnt.description',
  precondition: 'filter.cnt.precondition',
  instructions: 'filter.cnt.instructions',
  expectedResult: 'filter.cnt.expectedResult',
};

const FOLDER_SEARCH_KEYS: Record<SearchField, string> = {
  name: 'filter.cnt.testCaseName',
  description: 'filter.cnt.testCaseDescription',
  precondition: 'filter.cnt.testCasePrecondition',
  instructions: 'filter.cnt.testCaseInstructions',
  expectedResult: 'filter.cnt.testCaseExpectedResult',
};

const isSearchField = (value: unknown): value is SearchField =>
  SEARCH_FIELDS.includes(value as SearchField);

/** Trims the values and drops empty conditions; each field is kept once (the first one). */
export const normalizeSearchConditions = (conditions: SearchCondition[]): SearchCondition[] => {
  const seen = new Set<SearchField>();
  return conditions.reduce<SearchCondition[]>((result, { field, value }) => {
    const trimmed = value.trim();
    if (trimmed && !seen.has(field)) {
      seen.add(field);
      result.push({ field, value: trimmed });
    }
    return result;
  }, []);
};

/**
 * The applied conditions in the URL query: one JSON object (field to text) in the order the
 * conditions were added. The text may contain commas and line breaks.
 */
export const serializeSearchConditions = (conditions: SearchCondition[]): string | undefined => {
  const normalized = normalizeSearchConditions(conditions);
  if (!normalized.length) {
    return undefined;
  }
  return JSON.stringify(Object.fromEntries(normalized.map(({ field, value }) => [field, value])));
};

export const parseSearchConditionsFromQuery = (raw?: string): SearchCondition[] => {
  if (!raw) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return [];
    }
    return normalizeSearchConditions(
      Object.entries(parsed as Record<string, unknown>)
        .filter(([field, value]) => isSearchField(field) && typeof value === 'string')
        .map(([field, value]) => ({ field: field as SearchField, value: value as string })),
    );
  } catch {
    return [];
  }
};

const buildSearchParams = (
  keys: Record<SearchField, string>,
  raw?: string,
): Record<string, string> =>
  Object.fromEntries(
    parseSearchConditionsFromQuery(raw).map(({ field, value }) => [keys[field], value]),
  );

export const buildTestCaseSearchParams = (raw?: string) =>
  buildSearchParams(TEST_CASE_SEARCH_KEYS, raw);

export const buildFolderSearchParams = (raw?: string) => buildSearchParams(FOLDER_SEARCH_KEYS, raw);

/**
 * Adds a value to a request parameter. When the parameter already has a value, both are sent
 * (the API combines repeated search values with AND), for example the page search and the Name
 * condition.
 */
export const addSearchValue = <T extends Record<string, unknown>>(
  params: T,
  key: string,
  value?: string,
): T => {
  if (!value) {
    return params;
  }
  const current = params[key];
  if (current === undefined || current === null || current === '') {
    return { ...params, [key]: value };
  }
  const values = (Array.isArray(current) ? current : [current]) as string[];
  return values.includes(value) ? params : { ...params, [key]: [...values, value] };
};
