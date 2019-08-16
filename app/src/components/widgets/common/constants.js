import * as AVAILABLE_COLORS from 'common/constants/colors';

export const TO_INVESTIGATE = 'toInvestigate';
export const INVESTIGATED = 'investigated';
export const AUTOMATION_BUG = 'automationBug';
export const PRODUCT_BUG = 'productBug';
export const SYSTEM_ISSUE = 'systemIssue';
export const DEFECT_TYPES = [
  TO_INVESTIGATE,
  INVESTIGATED,
  AUTOMATION_BUG,
  PRODUCT_BUG,
  SYSTEM_ISSUE,
];
export const LAUNCHES_QUANTITY = 'launchesQuantity';

export const COLORS = {
  [TO_INVESTIGATE]: AVAILABLE_COLORS[`COLOR_${TO_INVESTIGATE.toUpperCase()}`],
  [INVESTIGATED]: AVAILABLE_COLORS[`COLOR_${INVESTIGATED.toUpperCase()}`],
  [AUTOMATION_BUG]: AVAILABLE_COLORS[`COLOR_${AUTOMATION_BUG.toUpperCase()}`],
  [PRODUCT_BUG]: AVAILABLE_COLORS[`COLOR_${PRODUCT_BUG.toUpperCase()}`],
  [SYSTEM_ISSUE]: AVAILABLE_COLORS[`COLOR_${SYSTEM_ISSUE.toUpperCase()}`],
};
