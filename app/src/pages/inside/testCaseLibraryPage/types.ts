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

export interface TestCase {
  id: number;
  name: string;
  priority: TestCasePriority;
  path: string[];
  tags: Tag[];
  createdAt: number;
  description?: string;
  updatedAt?: number;
  durationTime?: number;
  scenarios?: IScenario[];
  testFolder: {
    id: number;
  };
}
