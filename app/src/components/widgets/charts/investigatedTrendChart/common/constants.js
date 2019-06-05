import { defineMessages } from 'react-intl';
import { getItemColor } from 'components/widgets/charts/common/utils';

export const TO_INVESTIGATE = 'toInvestigate';
export const INVESTIGATED = 'investigated';
export const DEFECT_TYPES = [TO_INVESTIGATE, INVESTIGATED];
export const LAUNCHES_QUANTITY = 'launchesQuantity';

export const COLORS = {
  [TO_INVESTIGATE]: getItemColor({ defectType: TO_INVESTIGATE }),
  [INVESTIGATED]: getItemColor({ defectType: INVESTIGATED }),
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
});
