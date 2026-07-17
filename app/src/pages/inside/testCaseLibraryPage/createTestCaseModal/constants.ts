import { uniqueId } from 'common/utils';
import { ManualScenarioType } from '../types';

export const DEFAULT_EXECUTION_ESTIMATION_TIME = 5;

export const TEST_CASE_FORM_INITIAL_VALUES = {
  priority: 'unspecified' as const,
  manualScenarioType: ManualScenarioType.STEPS,
  executionEstimationTime: DEFAULT_EXECUTION_ESTIMATION_TIME,
  attributes: [],
  requirements: [{ id: uniqueId(), value: '' }],
};
