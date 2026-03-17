export interface ClearStatusModalData {
  executionId: string;
  launchId: string;
}

export enum EXECUTION_STATUSES {
  FAILED = 'FAILED',
  PASSED = 'PASSED',
  SKIPPED = 'SKIPPED',
  TO_RUN = 'TO_RUN',
}
