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

import { formatAttribute } from 'common/utils/attributeUtils';

const URL_KEYS = {
  STATUSES: 'filterStatuses',
  COMPLETION: 'filterCompletion',
  START_TIME_FROM: 'filterStartTimeFrom',
  START_TIME_TO: 'filterStartTimeTo',
  TEST_PLAN: 'filterTestPlan',
  TEST_PLAN_NAME: 'filterTestPlanName',
  COMPOSITE_ATTRIBUTE: 'filterCompositeAttribute',
} as const;

export const MANUAL_LAUNCHES_FILTER_URL_KEYS = URL_KEYS;

export type ManualLaunchesFilterURLQuery = Partial<
  Record<(typeof URL_KEYS)[keyof typeof URL_KEYS], string | undefined>
>;

const COMPOSITE_ATTRIBUTE_QUERY_KEY = 'filterAttributeComposite';

export const MANUAL_LAUNCHES_FILTER_ATTRIBUTE_KEY_QUERY_KEY = 'filterAttributeKey';
export const MANUAL_LAUNCHES_FILTER_ATTRIBUTE_VALUE_QUERY_KEY = 'filterAttributeValue';

export const readCompositeFromQuery = (
  query: Record<string, string | undefined>,
): string | undefined => {
  const raw =
    query[URL_KEYS.COMPOSITE_ATTRIBUTE]?.trim() ||
    query[COMPOSITE_ATTRIBUTE_QUERY_KEY]?.trim();

  return raw || undefined;
};

export const resolveFilterCompositeAttributeForApi = (
  query: Record<string, string | undefined> | undefined,
): string | undefined => {
  if (!query) {
    return undefined;
  }

  const fromComposite = readCompositeFromQuery(query);

  if (fromComposite) {
    return fromComposite;
  }

  const keyRaw = query[MANUAL_LAUNCHES_FILTER_ATTRIBUTE_KEY_QUERY_KEY]?.trim();

  if (!keyRaw) {
    return undefined;
  }

  return formatAttribute({
    key: keyRaw,
    value: query[MANUAL_LAUNCHES_FILTER_ATTRIBUTE_VALUE_QUERY_KEY] ?? '',
  }) as string;
};
