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

export const NAME_FIELD_MAX_LENGTH = 255;
export const FOLDER_FIELD_MAX_LENGTH = 48;
export const DESCRIPTION_FIELD_MAX_LENGTH = 2048;
export const REQUIREMENT_FIELD_MAX_LENGTH = 255;
export const PRECONDITION_FIELD_MAX_LENGTH = 2048;
export const INSTRUCTIONS_FIELD_MAX_LENGTH = 2048;
export const EXPECTED_RESULT_FIELD_MAX_LENGTH = 2048;
