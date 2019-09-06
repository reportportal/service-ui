import { defineMessages } from 'react-intl';
import {
  AUTOMATION_BUG,
  INVESTIGATED,
  LAUNCHES_QUANTITY,
  PRODUCT_BUG,
  SYSTEM_ISSUE,
  TO_INVESTIGATE,
} from './constants';

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
  xAxisWeeksTitle: {
    id: 'Chart.xAxisWeeksTitle',
    defaultMessage: 't, weeks',
  },
  xAxisDaysTitle: {
    id: 'Chart.xAxisDaysTitle',
    defaultMessage: 't, days',
  },
  [TO_INVESTIGATE]: {
    id: `Chart.label.toInvestigate`,
    defaultMessage: 'To Investigate',
  },
  [INVESTIGATED]: {
    id: `Chart.label.investigated`,
    defaultMessage: 'Investigated',
  },
  [PRODUCT_BUG]: {
    id: `Chart.label.productBug`,
    defaultMessage: 'Product Bug',
  },
  [AUTOMATION_BUG]: {
    id: `Chart.label.automationBug`,
    defaultMessage: 'Automation Bug',
  },
  [SYSTEM_ISSUE]: {
    id: `Chart.label.systemIssue`,
    defaultMessage: 'System Issue',
  },
  [LAUNCHES_QUANTITY]: {
    id: `Chart.label.launchesQuantity`,
    defaultMessage: 'Launches',
  },
  passingRate: {
    id: 'Charts.passingRate',
    defaultMessage: 'Passing rate',
  },
  testCasesCaption: {
    id: 'Charts.testCasesCaption',
    defaultMessage: 'Test cases',
  },
});
