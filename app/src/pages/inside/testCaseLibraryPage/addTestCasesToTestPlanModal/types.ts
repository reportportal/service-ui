import { TestPlanDto } from 'controllers/testPlan';

export interface AddTestCasesToTestPlanModalData {
  selectedTestCaseIds: number[];
}

export interface AddTestCasesToTestPlanModalProps {
  data: AddTestCasesToTestPlanModalData;
}

export interface AddTestCasesToTestPlanFormData {
  selectedTestPlan: TestPlanDto;
}
