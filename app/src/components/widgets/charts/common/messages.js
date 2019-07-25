import { defineMessages } from 'react-intl';

export const messages = defineMessages({
  total: {
    id: 'Charts.total',
    defaultMessage: 'Total {type}',
  },
  passed: {
    id: 'Charts.passed',
    defaultMessage: 'Passed',
  },
  failed: {
    id: 'Charts.failed',
    defaultMessage: 'Failed',
  },
  skipped: {
    id: 'Charts.skipped',
    defaultMessage: 'Skipped',
  },
  notPassed: {
    id: 'Charts.notPassed',
    defaultMessage: 'Not passed',
  },
  cases: {
    id: 'Charts.cases',
    defaultMessage: 'cases',
  },
  launchName: {
    id: 'Charts.launchName',
    defaultMessage: 'Launch name:',
  },
  filterLabel: {
    id: 'Charts.filterLabel',
    defaultMessage: 'Filter:',
  },
  failedSkippedTotal: {
    id: 'Charts.failedSkippedTotal',
    defaultMessage: '% (Failed+Skipped)/Total',
  },
});
