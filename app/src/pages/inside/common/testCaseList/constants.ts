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

export const STATUS_TYPES = {
  BLOCKER: 'blocker',
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  UNSPECIFIED: 'unspecified',
} as const;

export { TABLE_PAGE_SIZE_OPTIONS as ITEMS_PER_PAGE_OPTIONS } from '../paginationConstants';

export const TestCasePageDefaultValues = {
  limit: 50,
  offset: 0,
};

export const TEST_CASE_LIST_NAMESPACE = 'testCaseList';

export interface FilterKeyMap {
  readonly priority: string;
  readonly attributeKey: string;
}

export const TEST_CASE_FILTER_KEYS: FilterKeyMap = {
  priority: 'filter.in.priority',
  attributeKey: 'filter.has.attributeKey',
} as const;

export const FOLDER_FILTER_KEYS: FilterKeyMap = {
  priority: 'filter.in.testCasePriority',
  attributeKey: 'filter.has.testCaseAttributeKey',
} as const;
