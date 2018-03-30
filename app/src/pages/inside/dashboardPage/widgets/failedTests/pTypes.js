import { string, shape, arrayOf, bool, number } from 'prop-types';

export const PTLaunch = shape({
  id: string.isRequired,
  name: string.isRequired,
  number: string.isRequired,
});

const PTTest = shape({
  name: string.isRequired,
  uniqueId: string.isRequired,
  percentage: string.isRequired,
  isFailed: arrayOf(bool).isRequired,
  total: number.isRequired,
  failedCount: number.isRequired,
});

export const PTTests = arrayOf(PTTest);
