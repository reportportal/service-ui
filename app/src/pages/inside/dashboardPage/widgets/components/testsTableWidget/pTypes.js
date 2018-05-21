import { string, node, shape, arrayOf, bool, number, oneOf } from 'prop-types';
import { FAILED, PASSED, SKIPPED } from 'common/constants/launchStatuses';

export const PTLaunch = shape({
  id: string.isRequired,
  name: string.isRequired,
  number: string.isRequired,
  issueType: string,
});

export const PTStatus = oneOf([FAILED.toUpperCase(), PASSED.toUpperCase(), SKIPPED.toUpperCase()]);

export const PTTest = shape({
  name: string.isRequired,
  uniqueId: string.isRequired,
  percentage: string.isRequired,
  isFailed: arrayOf(bool),
  total: number.isRequired,
  failedCount: number,
  switchCounter: number,
  statuses: arrayOf(PTStatus),
});

export const PTColumns = shape({
  name: shape({
    header: node.isRequired,
  }).isRequired,
  count: shape({
    header: node.isRequired,
    headerShort: node.isRequired,
    countKey: string.isRequired,
    matrixKey: string.isRequired,
    renderAsBool: bool,
  }).isRequired,
  percents: shape({
    header: node.isRequired,
    headerShort: node.isRequired,
  }),
  date: shape({
    header: node.isRequired,
  }),
});

export const PTTests = arrayOf(PTTest);
