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

import { VoidFn } from '@reportportal/ui-kit/common/types/commonTypes';
import { TestCaseExecution } from 'controllers/manualLaunch';

export interface SingleDeleteExecutionData {
  type: 'single';
  execution: TestCaseExecution;
  launchId: string | number;
}

export interface BatchDeleteExecutionData {
  type: 'batch';
  executionIds: number[];
  launchId: string | number;
  onClearSelection?: VoidFn;
}

export type DeleteExecutionModalData = SingleDeleteExecutionData | BatchDeleteExecutionData;
