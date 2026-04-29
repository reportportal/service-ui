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

import { TransformedFolder } from 'controllers/testCase';
import { TestCase } from 'types/testCase';

export const TEST_CASE_DRAG_TYPE = 'LIBRARY_TEST_CASE_DRAG';
export const FOLDER_DRAG_TYPE = 'LIBRARY_FOLDER_DRAG';

export const TEST_PLAN_DRAG_TYPES = [TEST_CASE_DRAG_TYPE, FOLDER_DRAG_TYPE] as const;

export interface TestCaseDragItem extends Record<string, unknown> {
  ids: number[];
  testCases: TestCase[];
  isMulti: boolean;
}

export interface FolderDragItem extends Record<string, unknown> {
  folder: TransformedFolder;
  folders: TransformedFolder[];
  isMulti: boolean;
  testCasesCount: number;
}

export type DragItem = TestCaseDragItem | FolderDragItem;
