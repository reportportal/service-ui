import { FC, SVGProps } from 'react';
import { TestCasePriority } from 'pages/inside/common/priorityIcon/types';
import { Attachment, TestStep } from './createTestCaseModal/useCreateTestCase';
import { FolderWithFullPath } from 'controllers/testCase/types';

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

export interface IScenario {
  id: string;
  precondition: string;
  instruction: string;
  expectedResult: string;
  attachments: IAttachment[];
}

export enum ManualScenarioType {
  STEPS = 'STEPS',
  TEXT = 'TEXT',
}

interface ManualScenarioCommon {
  executionEstimationTime: number;
  linkToRequirements: string;
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
  tags: Tag[];
  updatedAt: number;
  durationTime?: number;
  scenarios?: IScenario[];
  manualScenario?: ManualScenarioDto;
  testFolder: {
    id: number;
  };
}

interface ManualScenario {
  manualScenarioType: string;
  id: number;
  executionEstimationTime: number;
  linkToRequirements: string;
  preconditions: {
    value: string;
    attachments: Attachment[];
  };
  attributes: Attachment[];
  steps: {
    id: number;
    instructions: string;
    expectedResult: string;
    attachments: Attachment[];
  }[];
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

export interface CreateTestCaseFormData {
  name: string;
  description?: string;
  folder: FolderWithFullPath | string;
  priority?: TestCasePriority;
  linkToRequirements?: string;
  executionEstimationTime?: number;
  manualScenarioType: ManualScenarioType;
  precondition?: string;
  preconditionAttachments?: Attachment[];
  steps?: TestStep[];
  instructions?: string;
  expectedResult?: string;
  textAttachments?: Attachment[];
  tags?: string[];
}
