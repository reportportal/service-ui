import { defineMessages } from 'react-intl';
import { getItemColor } from 'components/widgets/charts/common/utils';

export const AUTOMATION_BUG = 'automationBug';
export const TO_INVESTIGATE = 'toInvestigate';
export const DEFECT_TYPES = [AUTOMATION_BUG, TO_INVESTIGATE];

export const COLORS = {
  [AUTOMATION_BUG]: getItemColor({ defectType: AUTOMATION_BUG }),
  [TO_INVESTIGATE]: getItemColor({ defectType: TO_INVESTIGATE }),
};

export const MESSAGES = defineMessages({
  xAxisWeeksTitle: {
    id: 'AutoBugsStatusPageChart.xAxisWeeksTitle',
    defaultMessage: 't, weeks',
  },
  xAxisDaysTitle: {
    id: 'AutoBugsStatusPageChart.xAxisDaysTitle',
    defaultMessage: 't, days',
  },
  [AUTOMATION_BUG]: {
    id: `AutoBugsStatusPageChart.label.${AUTOMATION_BUG}`,
    defaultMessage: 'Automation Bug',
  },
  [TO_INVESTIGATE]: {
    id: `AutoBugsStatusPageChart.label.${TO_INVESTIGATE}`,
    defaultMessage: 'To Investigate',
  },
});
