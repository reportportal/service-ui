import { TestCasePriority } from 'pages/inside/common/priorityIcon/types';
// The structure must be corrected after BE integration
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
