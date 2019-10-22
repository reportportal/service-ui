import { FAILED, INTERRUPTED, PASSED, SKIPPED } from 'common/constants/launchStatuses';
import {
  STATS_TOTAL,
  STATS_SKIPPED,
  STATS_PASSED,
  STATS_FAILED,
} from 'common/constants/statistics';
import { getItemNameConfig } from 'components/widgets/common/utils';

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

export const groupFieldsWithDefectTypes = (contentFields) =>
  contentFields.reduce((acc, item) => {
    const { defectType, locator } = getItemNameConfig(item);
    const itemKey = locator && defectType ? defectType : item;

    if (acc[itemKey]) {
      acc[itemKey].push(item);
    } else {
      acc[itemKey] = [item];
    }

    return acc;
  }, {});
