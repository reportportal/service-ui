import type { TestPlanDto } from 'controllers/testPlan/types';

export type TestPlanWithMilestone = TestPlanDto & {
  milestoneName?: string;
};

export interface AddTestCasesToTestPlanModalData {
  folderId?: number;
  itemCount?: number;
  selectedTestCaseIds?: number[];
}

export interface AddTestCasesToTestPlanModalProps {
  data: AddTestCasesToTestPlanModalData;
}

export interface AddTestCasesToTestPlanFormData {
  selectedTestPlan: TestPlanWithMilestone;
}
