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

import type { Page } from 'types/common';

export interface TestCaseActivityHistoryEntry {
  field: string;
  oldValue: string;
  newValue: string;
  sqlType: number;
}

export interface TestCaseActivityItem {
  id: number;
  created_at: string;
  event_name: string;
  object_id: number;
  object_name: string;
  object_type: string;
  project_id: number;
  project_name: string;
  subject_name: string;
  subject_type: string;
  subject_id: string;
  details: {
    history: TestCaseActivityHistoryEntry[];
    sqlType: number;
  };
}

export interface TestCaseActivityResponse {
  content: TestCaseActivityItem[];
  page: Page;
}

export interface TestCaseActivityTableRow {
  rowKey: string;
  item: TestCaseActivityItem;
  historyEntry: TestCaseActivityHistoryEntry | null;
}
