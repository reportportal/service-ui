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
import { TestCaseManualScenario } from 'pages/inside/common/testCaseList/types';

type Tag = {
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
  id: string;
  instructions: string;
  expectedResult: string;
  attachments?: Attachment[];
}

export interface Attachment {
  fileName: string;
  fileSize: number;
  id: number;
  fileType: string;
}

export interface TestCase {
  id: number;
  name: string;
  priority: TestCasePriority;
  createdAt: number;
  description?: string;
  path: string[];
  attributes?: Tag[];
  updatedAt: number;
  durationTime?: number;
  testFolder: {
    id: number;
  };
  lastExecution?: {
    startedAt: string;
    duration: number;
  };
}

export interface ManualScenario {
  manualScenarioType: TestCaseManualScenario;
  id: number;
  executionEstimationTime: number;
  linkToRequirements: string;
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

export interface ExtendedTestCase extends TestCase {
  manualScenario?: ManualScenario;
}

export interface ActionButton {
  name: string;
  dataAutomationId: string;
  icon?: FC<SVGProps<SVGSVGElement>>;
  isCompact: boolean;
  variant?: string;
  handleButton: () => void;
}
