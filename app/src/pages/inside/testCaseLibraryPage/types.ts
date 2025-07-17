import { TestCasePriority } from 'pages/inside/common/priorityIcon/types';

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
  id: string;
  name: string;
  priority: TestCasePriority;
  path: string[];
  tags: string[];
  created: number;
  description?: string;
  lastExecution?: number;
  durationTime?: number;
  scenarios?: IScenario[];
}
