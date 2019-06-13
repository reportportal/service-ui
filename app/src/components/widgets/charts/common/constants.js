import { defineMessages } from 'react-intl';
import { getItemColor } from 'components/widgets/charts/common/utils';

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
  [TO_INVESTIGATE]: getItemColor({ defectType: TO_INVESTIGATE }),
  [INVESTIGATED]: getItemColor({ defectType: INVESTIGATED }),
  [AUTOMATION_BUG]: getItemColor({ defectType: AUTOMATION_BUG }),
  [PRODUCT_BUG]: getItemColor({ defectType: PRODUCT_BUG }),
  [SYSTEM_ISSUE]: getItemColor({ defectType: SYSTEM_ISSUE }),
};

export const MESSAGES = defineMessages({
  xAxisWeeksTitle: {
    id: 'Chart.xAxisWeeksTitle',
    defaultMessage: 't, weeks',
  },
  xAxisDaysTitle: {
    id: 'Chart.xAxisDaysTitle',
    defaultMessage: 't, days',
  },
  yAxisInvestigationsTitle: {
    id: 'Chart.yAxisTitle',
    defaultMessage: '% of investigations',
  },
  [TO_INVESTIGATE]: {
    id: `Chart.label.${TO_INVESTIGATE}`,
    defaultMessage: 'To Investigate',
  },
  [INVESTIGATED]: {
    id: `Chart.label.${INVESTIGATED}`,
    defaultMessage: 'Investigated',
  },
  [PRODUCT_BUG]: {
    id: `Chart.label.${PRODUCT_BUG}`,
    defaultMessage: 'Product Bug',
  },
  [AUTOMATION_BUG]: {
    id: `Chart.label.${AUTOMATION_BUG}`,
    defaultMessage: 'Automation Bug',
  },
  [SYSTEM_ISSUE]: {
    id: `Chart.label.${SYSTEM_ISSUE}`,
    defaultMessage: 'System Issue',
  },
  [LAUNCHES_QUANTITY]: {
    id: `Chart.label.${LAUNCHES_QUANTITY}`,
    defaultMessage: 'Launches',
  },
});
