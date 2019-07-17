import { string, node, shape, arrayOf, bool, number, oneOf, oneOfType } from 'prop-types';
import { FAILED, PASSED, SKIPPED } from 'common/constants/launchStatuses';

export const PTLaunch = shape({
  id: string.isRequired,
  name: string.isRequired,
  number: string.isRequired,
  issueType: string,
});

export const PTStatus = oneOf([FAILED.toUpperCase(), PASSED.toUpperCase(), SKIPPED.toUpperCase()]);

export const PTTest = shape({
  name: string,
  itemName: string,
  uniqueId: string.isRequired,
  status: arrayOf(oneOfType([oneOf([FAILED, PASSED]), bool])),
  total: number,
  criteria: number,
  flakyCount: number,
  statuses: arrayOf(PTStatus),
});

export const PTColumns = shape({
  name: shape({
    header: node.isRequired,
    nameKey: string.isRequired,
  }).isRequired,
  date: shape({
    header: node.isRequired,
    dateKey: string.isRequired,
  }),
  count: shape({
    header: node.isRequired,
    headerShort: node.isRequired,
    countKey: string.isRequired,
    matrixKey: string.isRequired,
    renderAsBool: bool,
  }),
  percents: shape({
    header: node.isRequired,
    headerShort: node.isRequired,
  }),
  status: shape({
    header: node.isRequired,
    statusKey: string.isRequired,
  }),
  duration: shape({
    header: node.isRequired,
    durationKey: string.isRequired,
  }),
});

export const PTTests = arrayOf(PTTest);
