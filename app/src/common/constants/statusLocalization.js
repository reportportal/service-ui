import { defineMessages } from 'react-intl';
import * as statuses from './testStatuses';

export const statusLocalization = defineMessages({
  [statuses.PASSED]: {
    id: 'TestStatuses.passed',
    defaultMessage: 'Passed',
  },
  [statuses.FAILED]: {
    id: 'TestStatuses.failed',
    defaultMessage: 'Failed',
  },
  [statuses.IN_PROGRESS]: {
    id: 'TestStatuses.inProgress',
    defaultMessage: 'In progress',
  },
  [statuses.INTERRUPTED]: {
    id: 'TestStatuses.interrupted',
    defaultMessage: 'Interrupted',
  },
  [statuses.SKIPPED]: {
    id: 'TestStatuses.skipped',
    defaultMessage: 'Skipped',
  },
  [statuses.STOPPED]: {
    id: 'TestStatuses.stopped',
    defaultMessage: 'Stopped',
  },
  [statuses.RESETED]: {
    id: 'TestStatuses.reseted',
    defaultMessage: 'Reseted',
  },
});
