import React from 'react';
import { FormattedMessage, defineMessages } from 'react-intl';
import {
  STATS_TOTAL,
  STATS_PASSED,
  STATS_FAILED,
  STATS_SKIPPED,
} from 'common/constants/statistics';
import { STATS_SI, STATS_AB, STATS_ND, STATS_TI, STATS_PB } from '../components/constants';
import {
  defaultDefectsMessages,
  failedColumnFullTitle,
  failedColumnShortTitle,
  passedColumnFullTitle,
  passedColumnShortTitle,
  skippedColumnFullTitle,
  skippedColumnShortTitle,
  totalColumnFullTitle,
  totalColumnShortTitle,
} from '../components/messages';
import { NAME, FILTER_NAME, START_TIME, STATUS, PASSING_RATE } from './constants';

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
    full: defaultDefectsMessages[STATS_PB],
  },
  [STATS_AB]: {
    full: defaultDefectsMessages[STATS_AB],
  },
  [STATS_SI]: {
    full: defaultDefectsMessages[STATS_SI],
  },
  [STATS_ND]: {
    full: defaultDefectsMessages[STATS_ND],
  },
  [STATS_TI]: {
    full: defaultDefectsMessages[STATS_TI],
  },
  [PASSING_RATE]: {
    full: passingRateColumnFullTitle,
    short: passingRateColumnShortTitle,
  },
};
