import { FC, SVGProps } from 'react';
import { TestCasePriority } from 'pages/inside/common/priorityIcon/types';

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

export interface TestCaseBasicInfo {
  id: number;
  name: string;
  priority: TestCasePriority;
  createdAt: number;
}

export interface TestCase extends TestCaseBasicInfo {
  path: string[];
  tags: Tag[];
  description?: string;
  updatedAt: number;
  durationTime?: number;
  scenarios?: IScenario[];
  testFolder: {
    id: number;
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
