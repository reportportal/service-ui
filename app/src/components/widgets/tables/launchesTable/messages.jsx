import React from 'react';
import { FormattedMessage, defineMessages } from 'react-intl';
import {
  STATS_TOTAL,
  STATS_PASSED,
  STATS_FAILED,
  STATS_SKIPPED,
} from 'common/constants/statistics';
import {
  END_TIME,
  NAME,
  START_TIME,
  STATS_AB,
  STATS_PB,
  STATS_SI,
  STATS_TI,
  STATUS,
} from './constants';

const nameColumnTitle = (
  <FormattedMessage id={'LaunchesTable.nameColumn'} defaultMessage={'Name'} />
);
const statusColumnTitle = (
  <FormattedMessage id={'LaunchesTable.statusColumn'} defaultMessage={'Status'} />
);
const startTimeColumnFullTitle = (
  <FormattedMessage id={'LaunchesTable.startTimeColumnFull'} defaultMessage={'Start time'} />
);
const startTimeColumnShortTitle = (
  <FormattedMessage id={'LaunchesTable.startTimeColumnShort'} defaultMessage={'Start'} />
);
const endTimeColumnFullTitle = (
  <FormattedMessage id={'LaunchesTable.endTimeColumnFull'} defaultMessage={'End time'} />
);
const endTimeColumnShortTitle = (
  <FormattedMessage id={'LaunchesTable.endTimeColumnShort'} defaultMessage={'End'} />
);
const totalColumnFullTitle = (
  <FormattedMessage id={'LaunchesTable.totalColumnFull'} defaultMessage={'Total'} />
);
const totalColumnShortTitle = (
  <FormattedMessage id={'LaunchesTable.totalColumnShort'} defaultMessage={'Ttl'} />
);
const passedColumnFullTitle = (
  <FormattedMessage id={'LaunchesTable.passedColumnFull'} defaultMessage={'Passed'} />
);
const passedColumnShortTitle = (
  <FormattedMessage id={'LaunchesTable.passedColumnShort'} defaultMessage={'ps'} />
);
const failedColumnFullTitle = (
  <FormattedMessage id={'LaunchesTable.failedColumnFull'} defaultMessage={'Failed'} />
);
const failedColumnShortTitle = (
  <FormattedMessage id={'LaunchesTable.failedColumnShort'} defaultMessage={'fl'} />
);
const skippedColumnFullTitle = (
  <FormattedMessage id={'LaunchesTable.skippedColumnFull'} defaultMessage={'Skipped'} />
);
const skippedColumnShortTitle = (
  <FormattedMessage id={'LaunchesTable.skippedColumnShort'} defaultMessage={'skp'} />
);

export const hintMessages = defineMessages({
  statusHint: {
    id: 'LaunchesTable.statusHint',
    defaultMessage: 'Status:',
  },
  startTimeHint: {
    id: 'LaunchesTable.startTimeHint',
    defaultMessage: 'Start time:',
  },
  endTimeHint: {
    id: 'LaunchesTable.endTimeHint',
    defaultMessage: 'Finish time:',
  },
});

export const defaultStatusesMessages = {
  [STATS_TI]: 'To investigate',
  [STATS_PB]: 'Product bug',
  [STATS_AB]: 'Automation bug',
  [STATS_SI]: 'System issue',
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
    short: nameColumnTitle,
  },
  [STATUS]: {
    full: statusColumnTitle,
    short: statusColumnTitle,
  },
  [START_TIME]: {
    full: startTimeColumnFullTitle,
    short: startTimeColumnShortTitle,
  },
  [END_TIME]: {
    full: endTimeColumnFullTitle,
    short: endTimeColumnShortTitle,
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
  [STATS_TI]: {
    full: defaultStatusesMessages[STATS_TI],
    short: 'to invest',
  },
  [STATS_AB]: {
    full: 'Auto bug',
    short: 'Auto bug',
  },
  [STATS_PB]: {
    full: defaultStatusesMessages[STATS_PB],
    short: defaultStatusesMessages[STATS_PB],
  },
  [STATS_SI]: {
    full: defaultStatusesMessages[STATS_SI],
    short: defaultStatusesMessages[STATS_SI],
  },
};
