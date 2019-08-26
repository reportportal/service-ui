import React from 'react';
import { FormattedMessage, defineMessages } from 'react-intl';
import {
  STATS_TOTAL,
  STATS_PASSED,
  STATS_FAILED,
  STATS_SKIPPED,
} from 'common/constants/statistics';
import { STATS_SI, STATS_AB, STATS_TI, STATS_PB } from '../components/constants';
import {
  defaultDefectsMessages,
  totalColumnFullTitle,
  skippedColumnShortTitle,
  skippedColumnFullTitle,
  passedColumnShortTitle,
  passedColumnFullTitle,
  failedColumnShortTitle,
  failedColumnFullTitle,
  totalColumnShortTitle,
} from '../components/messages';
import { END_TIME, NAME, START_TIME, STATUS } from './constants';

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
  <FormattedMessage id={'LaunchesTable.endTimeColumnFull'} defaultMessage={'Finish time'} />
);
const endTimeColumnShortTitle = (
  <FormattedMessage id={'LaunchesTable.endTimeColumnShort'} defaultMessage={'Finish'} />
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
    full: defaultDefectsMessages[STATS_TI],
    short: 'to invest',
  },
  [STATS_AB]: {
    full: 'Auto bug',
  },
  [STATS_PB]: {
    full: defaultDefectsMessages[STATS_PB],
  },
  [STATS_SI]: {
    full: defaultDefectsMessages[STATS_SI],
  },
};
