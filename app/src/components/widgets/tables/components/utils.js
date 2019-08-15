import { FAILED, INTERRUPTED, PASSED, SKIPPED } from 'common/constants/launchStatuses';
import {
  STATS_TOTAL,
  STATS_SKIPPED,
  STATS_PASSED,
  STATS_FAILED,
} from 'common/constants/statistics';

export const getStatisticsStatuses = (type) => {
  switch (type) {
    case STATS_TOTAL:
      return [
        PASSED.toUpperCase(),
        FAILED.toUpperCase(),
        SKIPPED.toUpperCase(),
        INTERRUPTED.toUpperCase(),
      ];
    case STATS_PASSED:
      return [PASSED.toUpperCase()];
    case STATS_FAILED:
      return [FAILED.toUpperCase(), INTERRUPTED.toUpperCase()];
    case STATS_SKIPPED:
      return [SKIPPED.toUpperCase()];
    default:
      break;
  }
  return [];
};

export const getPassingRate = (passed = 0, total) => `${Math.round(100 * passed / total)}%`;
