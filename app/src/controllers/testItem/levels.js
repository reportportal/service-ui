import { LEVEL_SUITE, LEVEL_TEST } from 'common/constants/launchLevels';
import { NAMESPACE as TEST_NAMESPACE } from 'controllers/test';
import { NAMESPACE as SUITE_NAMESPACE } from 'controllers/suite';

export const LEVELS = {
  [LEVEL_SUITE]: {
    order: 0,
    namespace: SUITE_NAMESPACE,
  },
  [LEVEL_TEST]: {
    order: 1,
    namespace: TEST_NAMESPACE,
  },
};
