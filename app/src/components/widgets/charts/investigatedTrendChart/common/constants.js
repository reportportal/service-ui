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
  yAxisTitle: {
    id: 'InvestigatedTrendChart.yAxisTitle',
    defaultMessage: '% of investigations',
  },
  xAxisWeeksTitle: {
    id: 'InvestigatedTrendChart.xAxisWeeksTitle',
    defaultMessage: 't, weeks',
  },
  xAxisDaysTitle: {
    id: 'InvestigatedTrendChart.xAxisDaysTitle',
    defaultMessage: 't, days',
  },
  [TO_INVESTIGATE]: {
    id: `InvestigatedTrendChart.label.${TO_INVESTIGATE}`,
    defaultMessage: 'To Investigate',
  },
  [INVESTIGATED]: {
    id: `InvestigatedTrendChart.label.${INVESTIGATED}`,
    defaultMessage: 'Investigated',
  },
  [LAUNCHES_QUANTITY]: {
    id: `InvestigatedTrendChart.label.${LAUNCHES_QUANTITY}`,
    defaultMessage: 'Launches',
  },
  [AUTOMATION_BUG]: {
    id: `InvestigatedTrendChart.label.${AUTOMATION_BUG}`,
    defaultMessage: 'Automation Bug',
  },
  [PRODUCT_BUG]: {
    id: `InvestigatedTrendChart.label.${PRODUCT_BUG}`,
    defaultMessage: 'Product Bug',
  },
  [SYSTEM_ISSUE]: {
    id: `InvestigatedTrendChart.label.${SYSTEM_ISSUE}`,
    defaultMessage: 'System Issue',
  },
});
