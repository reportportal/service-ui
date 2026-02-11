import { TestPlanDto } from 'controllers/testPlan';

export interface AddTestCasesToTestPlanModalData {
  selectedTestCaseIds: number[];
  isSingleTestCaseMode?: boolean;
}

export interface AddTestCasesToTestPlanModalProps {
  data: AddTestCasesToTestPlanModalData;
}

export interface AddTestCasesToTestPlanFormData {
  selectedTestPlan: TestPlanDto;
}
