import { TestCasePriority } from 'pages/inside/common/priorityIcon/types';

export interface TestCase {
  id: string | number;
  name: string;
  priority: TestCasePriority;
  tags: string[];
  created?: string;
  description?: string;
  hasScenario?: boolean;
  lastExecution?: string;
}
