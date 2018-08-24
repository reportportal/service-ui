import { NO_DEFECT, SYSTEM_ISSUE, AUTOMATION_BUG, PRODUCT_BUG } from 'common/constants/defectTypes';

export const DEFECT_TYPE_CONFIGURATION = [
  PRODUCT_BUG.toUpperCase(),
  AUTOMATION_BUG.toUpperCase(),
  SYSTEM_ISSUE.toUpperCase(),
  NO_DEFECT.toUpperCase(),
];
