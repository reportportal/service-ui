import React from 'react';
import { FormattedMessage } from 'react-intl';
import {
  STATS_TOTAL,
  STATS_PASSED,
  STATS_FAILED,
  STATS_SKIPPED,
} from 'common/constants/statistics';
import { STATS_AB, STATS_ND, STATS_PB, STATS_SI, STATS_TI } from './constants';

export const totalColumnFullTitle = (
  <FormattedMessage id={'TableWidgets.totalColumnFull'} defaultMessage={'Total'} />
);
export const totalColumnShortTitle = (
  <FormattedMessage id={'TableWidgets.totalColumnShort'} defaultMessage={'Ttl'} />
);
export const passedColumnFullTitle = (
  <FormattedMessage id={'TableWidgets.passedColumnFull'} defaultMessage={'Passed'} />
);
export const passedColumnShortTitle = (
  <FormattedMessage id={'TableWidgets.passedColumnShort'} defaultMessage={'ps'} />
);
export const failedColumnFullTitle = (
  <FormattedMessage id={'TableWidgets.failedColumnFull'} defaultMessage={'Failed'} />
);
export const failedColumnShortTitle = (
  <FormattedMessage id={'TableWidgets.failedColumnShort'} defaultMessage={'fl'} />
);
export const skippedColumnFullTitle = (
  <FormattedMessage id={'TableWidgets.skippedColumnFull'} defaultMessage={'Skipped'} />
);
export const skippedColumnShortTitle = (
  <FormattedMessage id={'TableWidgets.skippedColumnShort'} defaultMessage={'skp'} />
);

export const defaultDefectsMessages = {
  [STATS_TI]: 'To investigate',
  [STATS_PB]: 'Product bug',
  [STATS_AB]: 'Automation bug',
  [STATS_ND]: 'No defect',
  [STATS_SI]: 'System issue',
};

export const defaultStatisticsMessages = {
  [STATS_TOTAL]: totalColumnFullTitle,
  [STATS_PASSED]: passedColumnFullTitle,
  [STATS_FAILED]: failedColumnFullTitle,
  [STATS_SKIPPED]: skippedColumnFullTitle,
};
