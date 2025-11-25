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

export const ITEMS_PER_PAGE_OPTIONS: number[] = [10, 20, 50, 100];

export const TestCasePageDefaultValues = {
  size: 10,
  limit: 50,
  offset: 0,
};
