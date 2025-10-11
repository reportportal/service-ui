import { FC, SVGProps } from 'react';
import { TestCasePriority } from 'pages/inside/common/priorityIcon/types';
import { TestCaseManualScenario } from './testCaseList/types';

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
  id: number;
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

export interface IScenario {
  id: number;
  preconditions: {
    value: string;
    attachments: Attachment[];
  };
  steps: Step[];
  manualScenarioType: TestCaseManualScenario;
  attributes?: Tag[];
  instructions?: string;
  expectedResult?: string;
  attachments?: Attachment[];
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
  manualScenario?: IScenario;
  testFolder: {
    id: number;
  };
  lastExecution?: {
    startedAt: string;
    duration: number;
  };
}

export interface ActionButton {
  name: string;
  dataAutomationId: string;
  icon?: FC<SVGProps<SVGSVGElement>>;
  isCompact: boolean;
  variant?: string;
  handleButton: () => void;
}
