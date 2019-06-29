import React from 'react';
import { FormattedMessage, defineMessages } from 'react-intl';
import {
  STATS_TOTAL,
  STATS_PASSED,
  STATS_FAILED,
  STATS_SKIPPED,
} from 'common/constants/statistics';
import {
  NAME,
  FILTER_NAME,
  START_TIME,
  STATUS,
  STATS_PB,
  STATS_AB,
  STATS_SI,
  STATS_ND,
  STATS_TI,
  PASSING_RATE,
} from './constants';

const nameColumnTitle = (
  <FormattedMessage id={'ProductStatus.nameColumn'} defaultMessage={'Name'} />
);
const filterNameColumnTitle = (
  <FormattedMessage id={'ProductStatus.filterNameColumn'} defaultMessage={'Filter name'} />
);
const startTimeColumnFullTitle = (
  <FormattedMessage id={'ProductStatus.startTimeColumnFull'} defaultMessage={'Start time'} />
);
const startTimeColumnShortTitle = (
  <FormattedMessage id={'ProductStatus.startTimeColumnShort'} defaultMessage={'Start'} />
);
const statusColumnTitle = (
  <FormattedMessage id={'ProductStatus.statusColumn'} defaultMessage={'Status'} />
);
const totalColumnFullTitle = (
  <FormattedMessage id={'ProductStatus.totalColumnFull'} defaultMessage={'Total'} />
);
const totalColumnShortTitle = (
  <FormattedMessage id={'ProductStatus.totalColumnShort'} defaultMessage={'Ttl'} />
);
const passedColumnFullTitle = (
  <FormattedMessage id={'ProductStatus.passedColumnFull'} defaultMessage={'Passed'} />
);
const passedColumnShortTitle = (
  <FormattedMessage id={'ProductStatus.passedColumnShort'} defaultMessage={'Ps'} />
);
const failedColumnFullTitle = (
  <FormattedMessage id={'ProductStatus.failedColumnFull'} defaultMessage={'Failed'} />
);
const failedColumnShortTitle = (
  <FormattedMessage id={'ProductStatus.failedColumnShort'} defaultMessage={'Fl'} />
);
const skippedColumnFullTitle = (
  <FormattedMessage id={'ProductStatus.skippedColumnFull'} defaultMessage={'Skipped'} />
);
const skippedColumnShortTitle = (
  <FormattedMessage id={'ProductStatus.skippedColumnShort'} defaultMessage={'Skp'} />
);
const passingRateColumnFullTitle = (
  <FormattedMessage id={'ProductStatus.passingRateColumnFull'} defaultMessage={'Passing rate'} />
);
const passingRateColumnShortTitle = (
  <FormattedMessage id={'ProductStatus.passingRateColumnShort'} defaultMessage={'Pass rate'} />
);

export const hintMessages = defineMessages({
  statusHint: {
    id: 'ProductStatus.statusHint',
    defaultMessage: 'Status:',
  },
  startTimeHint: {
    id: 'ProductStatus.startTimeHint',
    defaultMessage: 'Start time:',
  },
});

export const totalMessage = {
  id: 'ProductStatus.totalColumnFull',
  defaultMessage: 'Total',
};

export const filterMessage = {
  id: 'ProductStatus.filterMessage',
  defaultMessage: 'Filter',
};

export const passingRateMessage = {
  id: 'ProductStatus.passingRateColumnFull',
  defaultMessage: 'Passing rate',
};

export const defaultStatusesMessages = {
  [STATS_PB]: 'Product bug',
  [STATS_AB]: 'Automation bug',
  [STATS_SI]: 'System issue',
  [STATS_ND]: 'No defect',
  [STATS_TI]: 'To investigate',
};

export const defaultStatisticsMessages = {
  [STATS_TOTAL]: totalColumnFullTitle,
  [STATS_PASSED]: passedColumnFullTitle,
  [STATS_FAILED]: failedColumnFullTitle,
  [STATS_SKIPPED]: skippedColumnFullTitle,
};

export const COLUMN_NAMES_MAP = {
  [NAME]: {
    full: nameColumnTitle,
  },
  [FILTER_NAME]: {
    full: filterNameColumnTitle,
  },
  [START_TIME]: {
    full: startTimeColumnFullTitle,
    short: startTimeColumnShortTitle,
  },
  [STATUS]: {
    full: statusColumnTitle,
  },
  [STATS_TOTAL]: {
    full: totalColumnFullTitle,
    short: totalColumnShortTitle,
  },
  [STATS_PASSED]: {
    full: passedColumnFullTitle,
    short: passedColumnShortTitle,
  },
  [STATS_FAILED]: {
    full: failedColumnFullTitle,
    short: failedColumnShortTitle,
  },
  [STATS_SKIPPED]: {
    full: skippedColumnFullTitle,
    short: skippedColumnShortTitle,
  },
  [STATS_PB]: {
    full: defaultStatusesMessages[STATS_PB],
  },
  [STATS_AB]: {
    full: defaultStatusesMessages[STATS_AB],
  },
  [STATS_SI]: {
    full: defaultStatusesMessages[STATS_SI],
  },
  [STATS_ND]: {
    full: defaultStatusesMessages[STATS_ND],
  },
  [STATS_TI]: {
    full: defaultStatusesMessages[STATS_TI],
  },
  [PASSING_RATE]: {
    full: passingRateColumnFullTitle,
    short: passingRateColumnShortTitle,
  },
};
