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
import { isEmpty } from 'es-toolkit/compat';

import { compareStringsLocale } from 'common/utils';
import { formatAttribute, parseQueryAttributes } from 'common/utils/attributeUtils';
import {
  MANUAL_LAUNCHES_FILTER_URL_KEYS,
  MANUAL_LAUNCHES_FILTER_ATTRIBUTE_KEY_QUERY_KEY,
  MANUAL_LAUNCHES_FILTER_ATTRIBUTE_VALUE_QUERY_KEY,
  readCompositeFromQuery,
  type ManualLaunchesFilterURLQuery,
} from 'common/manualLaunches/manualLaunchesFilterUrl';

import { COMPLETION_VALUES, EMPTY_FILTER, LAUNCH_STATUSES } from './constants';
import type { LaunchAttribute } from '../types';
import type {
  ManualLaunchesFilterPayload,
  StartTimeValue,
  TestPlanFilterOption,
} from './types';

export const buildManualLaunchesFilterPayload = (
  statuses: ManualLaunchesFilterPayload['statuses'],
  completion: ManualLaunchesFilterPayload['completion'],
  startTime: ManualLaunchesFilterPayload['startTime'],
  testPlan: ManualLaunchesFilterPayload['testPlan'],
  attributes: ManualLaunchesFilterPayload['attributes'],
): ManualLaunchesFilterPayload => ({
  statuses,
  completion,
  startTime,
  testPlan,
  attributes,
});

export const normalizeManualLaunchesFilterForCompare = (
  payload: ManualLaunchesFilterPayload,
): ManualLaunchesFilterPayload => ({
  ...payload,
  statuses: [...payload.statuses].sort(compareStringsLocale),
});

const COMPLETION_BACKEND_VALUES: Record<string, string | undefined> = {
  [COMPLETION_VALUES.HAS_NOT_EXECUTED_TESTS]: 'has_not_executed',
  [COMPLETION_VALUES.DONE]: 'done',
};

const COMPLETION_FROM_BACKEND_VALUES: Record<string, string> = {
  has_not_executed: COMPLETION_VALUES.HAS_NOT_EXECUTED_TESTS,
  done: COMPLETION_VALUES.DONE,
};

const VALID_STATUS_VALUES = new Set<string>(Object.values(LAUNCH_STATUSES));

const getStartTimeRange = (
  startTime: StartTimeValue | null,
): { from?: number; to?: number } => {
  if (!startTime) {
    return {};
  }
  return {
    from: startTime.startDate ? startTime.startDate.getTime() : undefined,
    to: startTime.endDate ? startTime.endDate.getTime() : undefined,
  };
};

export interface ManualLaunchesBackendFilterParams {
  itemStatus?: string;
  completion?: string;
  startTimeFrom?: number;
  endTimeTo?: number;
  testPlanId?: string;
  filterCompositeAttribute?: string;
}

export const buildManualLaunchesBackendFilterParams = (
  payload: ManualLaunchesFilterPayload,
): ManualLaunchesBackendFilterParams => {
  const params: ManualLaunchesBackendFilterParams = {};

  if (!isEmpty(payload.statuses)) {
    params.itemStatus = payload.statuses.join(',');
  }

  const backendCompletion = COMPLETION_BACKEND_VALUES[payload.completion];

  if (backendCompletion) {
    params.completion = backendCompletion;
  }

  const { from, to } = getStartTimeRange(payload.startTime);

  if (from !== undefined) {
    params.startTimeFrom = from;
  }
  if (to !== undefined) {
    params.endTimeTo = to;
  }

  if (payload.testPlan) {
    params.testPlanId = String(payload.testPlan.id);
  }

  const attributesWithKey = payload.attributes.filter((attribute) => attribute.key?.trim());

  if (!isEmpty(attributesWithKey)) {
    params.filterCompositeAttribute = attributesWithKey.map(formatAttribute).join(',');
  }

  return params;
};

const URL_KEYS = MANUAL_LAUNCHES_FILTER_URL_KEYS;

export const buildURLQueryFromFilters = (
  payload: ManualLaunchesFilterPayload,
): ManualLaunchesFilterURLQuery => {
  const { from, to } = getStartTimeRange(payload.startTime);
  const backendAttributes = buildManualLaunchesBackendFilterParams(payload);

  return {
    [URL_KEYS.STATUSES]:
      !isEmpty(payload.statuses) ? payload.statuses.join(',') : undefined,
    [URL_KEYS.COMPLETION]: COMPLETION_BACKEND_VALUES[payload.completion],
    [URL_KEYS.START_TIME_FROM]: from !== undefined ? String(from) : undefined,
    [URL_KEYS.START_TIME_TO]: to !== undefined ? String(to) : undefined,
    [URL_KEYS.TEST_PLAN]: payload.testPlan ? String(payload.testPlan.id) : undefined,
    [URL_KEYS.TEST_PLAN_NAME]: payload.testPlan?.name ?? undefined,
    [URL_KEYS.COMPOSITE_ATTRIBUTE]: backendAttributes.filterCompositeAttribute,
  };
};

const parseStatuses = (raw?: string): string[] => {
  if (!raw) {
    return [];
  }
  return raw.split(',').reduce<string[]>((acc, part) => {
    const value = part.trim();

    if (VALID_STATUS_VALUES.has(value)) {
      acc.push(value);
    }

    return acc;
  }, []);
};

const parseCompletion = (raw?: string): string => {
  if (!raw) {
    return COMPLETION_VALUES.ALL;
  }

  if (Object.values(COMPLETION_VALUES).includes(raw as (typeof COMPLETION_VALUES)[keyof typeof COMPLETION_VALUES])) {
    return raw;
  }

  return COMPLETION_FROM_BACKEND_VALUES[raw] ?? COMPLETION_VALUES.ALL;
};

const parseTrimmedFiniteNumber = (raw?: string): number | undefined => {
  const normalized = raw?.trim();
  if (!normalized) {
    return undefined;
  }
  const number = Number(normalized);

  return Number.isFinite(number) ? number : undefined;
};

const parseTimestamp = (raw?: string): Date | undefined => {
  const ms = parseTrimmedFiniteNumber(raw);

  if (ms === undefined) {
    return undefined;
  }
  const date = new Date(ms);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const parseTestPlan = (
  idRaw?: string,
  nameRaw?: string,
): TestPlanFilterOption | null => {
  const id = parseTrimmedFiniteNumber(idRaw);

  if (id === undefined) {
    return null;
  }
  return { id, name: nameRaw?.trim() || '' };
};

const parseStartTime = (fromRaw?: string, toRaw?: string): StartTimeValue | null => {
  const startDate = parseTimestamp(fromRaw);
  const endDate = parseTimestamp(toRaw);

  if (!startDate && !endDate) {
    return null;
  }

  return { startDate, endDate };
};

const parseAttributesFromKeyValue = (keyRaw?: string, valueRaw?: string): LaunchAttribute[] => {
  if (!keyRaw) {
    return [];
  }
  return [{ key: keyRaw, value: valueRaw ?? '' }];
};

const parseAttributesFromURL = (query: Record<string, string | undefined>): LaunchAttribute[] => {
  const compositeRaw = readCompositeFromQuery(query);

  if (compositeRaw) {
    const parsed = parseQueryAttributes({ value: compositeRaw }) as LaunchAttribute[];

    return parsed.filter((attribute) => attribute.key?.trim());
  }

  const keyRaw = query[MANUAL_LAUNCHES_FILTER_ATTRIBUTE_KEY_QUERY_KEY];
  const valueRaw = query[MANUAL_LAUNCHES_FILTER_ATTRIBUTE_VALUE_QUERY_KEY];

  return parseAttributesFromKeyValue(keyRaw, valueRaw);
};

export const parseFiltersFromURLQuery = (
  query: ManualLaunchesFilterURLQuery | undefined,
): ManualLaunchesFilterPayload => {
  if (!query) {
    return { ...EMPTY_FILTER };
  }

  return {
    statuses: parseStatuses(query[URL_KEYS.STATUSES]),
    completion: parseCompletion(query[URL_KEYS.COMPLETION]),
    startTime: parseStartTime(
      query[URL_KEYS.START_TIME_FROM],
      query[URL_KEYS.START_TIME_TO],
    ),
    testPlan: parseTestPlan(query[URL_KEYS.TEST_PLAN], query[URL_KEYS.TEST_PLAN_NAME]),
    attributes: parseAttributesFromURL(query as Record<string, string | undefined>),
  };
};
