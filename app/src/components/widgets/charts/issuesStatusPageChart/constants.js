import { defineMessages } from 'react-intl';
import { getItemColor } from 'components/widgets/charts/common/utils';

export const AUTOMATION_BUG = 'automationBug';
export const TO_INVESTIGATE = 'toInvestigate';
export const PRODUCT_BUG = 'productBug';
export const DEFECT_TYPES = [AUTOMATION_BUG, TO_INVESTIGATE, PRODUCT_BUG];

export const COLORS = {
  [AUTOMATION_BUG]: getItemColor({ defectType: AUTOMATION_BUG }),
  [TO_INVESTIGATE]: getItemColor({ defectType: TO_INVESTIGATE }),
  [PRODUCT_BUG]: getItemColor({ defectType: PRODUCT_BUG }),
};

export const MESSAGES = defineMessages({
  xAxisWeeksTitle: {
    id: 'IssuesStatusPageChart.xAxisWeeksTitle',
    defaultMessage: 't, weeks',
  },
  xAxisDaysTitle: {
    id: 'IssuesStatusPageChart.xAxisDaysTitle',
    defaultMessage: 't, days',
  },
  [AUTOMATION_BUG]: {
    id: `IssuesStatusPageChart.label.${AUTOMATION_BUG}`,
    defaultMessage: 'Automation Bug',
  },
  [TO_INVESTIGATE]: {
    id: `IssuesStatusPageChart.label.${TO_INVESTIGATE}`,
    defaultMessage: 'To Investigate',
  },
  [PRODUCT_BUG]: {
    id: `IssuesStatusPageChart.label.${PRODUCT_BUG}`,
    defaultMessage: 'Product Bug',
  },
});
