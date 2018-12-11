import { defineMessages } from 'react-intl';

const unique = (array, propName) =>
  array.filter((e, i) => array.findIndex((a) => a[propName] === e[propName]) === i);

export const getPercentage = (value) => (value * 100).toFixed(2);
export const getDefectItems = (items) =>
  unique(
    items.map((item) => ({
      id: item[0],
      count: item[1],
      name: item[0]
        .split('$')
        .slice(0, 3)
        .join('$'),
    })),
    'name',
  );

export const messages = defineMessages({
  statistics$executions$total: {
    id: 'FilterNameById.statistics$executions$total',
    defaultMessage: 'Total',
  },
  statistics$executions$passed: {
    id: 'FilterNameById.statistics$executions$passed',
    defaultMessage: 'Passed',
  },
  statistics$executions$failed: {
    id: 'FilterNameById.statistics$executions$failed',
    defaultMessage: 'Failed',
  },
  statistics$executions$skipped: {
    id: 'FilterNameById.statistics$executions$skipped',
    defaultMessage: 'Skipped',
  },
  statistics$defects$product_bug: {
    id: 'FilterNameById.statistics$defects$product_bug',
    defaultMessage: 'Product bug',
  },
  statistics$defects$automation_bug: {
    id: 'FilterNameById.statistics$defects$automation_bug',
    defaultMessage: 'Automation bug',
  },
  statistics$defects$system_issue: {
    id: 'FilterNameById.statistics$defects$system_issue',
    defaultMessage: 'System issue',
  },
  statistics$defects$no_defect: {
    id: 'FilterNameById.statistics$defects$no_defect',
    defaultMessage: 'No defect',
  },
  statistics$defects$to_investigate: {
    id: 'FilterNameById.statistics$defects$to_investigate',
    defaultMessage: 'To investigate',
  },
  ofTestCases: {
    id: 'Widgets.ofTestCases',
    defaultMessage: 'of test cases',
  },
});
