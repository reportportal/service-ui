import { TestCasePriority } from 'pages/inside/common/priorityIcon/types';
// The structure must be corrected after BE integration
export interface TestCase {
  id: string;
  name: string;
  priority: TestCasePriority;
  path: string[];
  tags: string[];
  created: number;
  description?: string;
  hasScenario?: boolean;
  lastExecution?: number;
  durationTime?: number;
}
