import { string, shape, arrayOf, bool, number, oneOf } from 'prop-types';

export const PTLaunch = shape({
  id: string.isRequired,
  name: string.isRequired,
  number: string.isRequired,
  issueType: string,
});

export const PTTest = shape({
  name: string.isRequired,
  uniqueId: string.isRequired,
  percentage: string.isRequired,
  isFailed: arrayOf(bool).isRequired,
  total: number.isRequired,
  failedCount: number.isRequired,
});

export const PTIssueType = oneOf([
  'statistics$executions$failed',
  'statistics$executions$skipped',
  'statistics$defects$product_bug$total',
  'statistics$defects$automation_bug$total',
  'statistics$defects$system_issue$total',
  'statistics$defects$no_defect$total',
]);

export const PTTests = arrayOf(PTTest);
