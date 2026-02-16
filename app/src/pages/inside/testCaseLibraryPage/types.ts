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

import { FC, SVGProps } from 'react';
import { TestCasePriority } from 'pages/inside/common/priorityIcon/types';
import { FolderWithFullPath } from 'controllers/testCase/types';
import { TestCaseManualScenario } from 'pages/inside/common/testCaseList/types';

export type Tag = {
  key: string;
  value?: string;
  id: number;
};

// The structure must be corrected after BE integration
export interface IAttachment {
  fileName: string;
  size: number;
}

export interface Step {
  id: number;
  instructions: string;
  expectedResult: string;
  attachments?: Attachment[];
  position?: number;
}

export interface Attachment {
  fileName: string;
  fileSize: number;
  id: number;
  fileType: string;
}

export enum ManualScenarioType {
  STEPS = 'STEPS',
  TEXT = 'TEXT',
}

interface ManualScenarioCommon {
  executionEstimationTime: number;
  requirements: Requirement[];
  manualScenarioType: ManualScenarioType;
  preconditions?: {
    value: string;
  };
}

interface ManualScenarioSteps extends ManualScenarioCommon {
  steps: TestStep[];
}

interface ManualScenarioText extends ManualScenarioCommon {
  instructions?: string;
  expectedResult?: string;
  attachments?: Attachment[];
}

export type ManualScenarioDto = ManualScenarioSteps | ManualScenarioText;

export interface TestCase {
  id: number;
  name: string;
  priority: TestCasePriority;
  createdAt: number;
  description?: string;
  path: string[];
  attributes?: (Tag | Attribute)[];
  updatedAt: number;
  durationTime?: number;
  testFolder: {
    id: number;
  };
  lastExecution?: Execution;
  tags?: { key: string }[];
  manualScenario?: ManualScenario;
}

export interface ManualScenario {
  manualScenarioType: TestCaseManualScenario;
  id: number;
  executionEstimationTime: number;
  requirements: Requirement[];
  preconditions: {
    value: string;
    attachments: Attachment[];
  };
  attributes?: Tag[];
  steps: Step[];
  instructions?: string;
  expectedResult?: string;
  attachments?: Attachment[];
}

export enum ExecutionStatus {
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  STOPPED = 'STOPPED',
  SKIPPED = 'SKIPPED',
  INTERRUPTED = 'INTERRUPTED',
  CANCELLED = 'CANCELLED',
  INFO = 'INFO',
  WARN = 'WARN',
  TO_RUN = 'TO_RUN',
}

export interface Execution {
  id: number;
  launch: {
    id: number;
    name: string;
    number: number;
  };
  status: ExecutionStatus;
  startedAt: number;
  duration: number;
}

export interface ExtendedTestCase extends TestCase {
  manualScenario?: ManualScenario;
  lastExecution?: Execution;
  executions?: Execution[];
}

export interface ActionButton {
  name: string;
  dataAutomationId: string;
  icon?: FC<SVGProps<SVGSVGElement>>;
  isCompact: boolean;
  variant?: string;
  handleButton: () => void;
}

export interface Attribute {
  id: number;
  key: string;
  value: string;
}

export interface Requirement {
  id: string;
  value: string;
}

export interface CreateTestCaseFormData {
  name: string;
  description?: string;
  folder: FolderWithFullPath | string;
  priority?: TestCasePriority;
  requirements?: Requirement[];
  executionEstimationTime?: number;
  manualScenarioType: ManualScenarioType;
  precondition?: string;
  preconditionAttachments?: Attachment[];
  steps?: TestStep[];
  instructions?: string;
  expectedResult?: string;
  textAttachments?: Attachment[];
  tags?: Tag[];
  attributes?: Attribute[];
}

export interface TestStep {
  instructions: string;
  expectedResult: string;
  attachments?: Attachment[];
  position?: number;
}

export interface DetailsEmptyStateProps {
  testCase: ExtendedTestCase;
}
