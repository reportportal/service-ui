import { PROJECT_LOG_PAGE, PROJECT_SETTINGS_TAB_PAGE, TEST_ITEM_PAGE } from 'controllers/pages';
import { ALL } from 'common/constants/reservedFilterIds';
import { getItemLevel } from 'controllers/testItem';
import { LEVEL_STEP } from 'common/constants/launchLevels';

export const getProjectSettingTabPageLink = (projectId, settingsTab) => ({
  type: PROJECT_SETTINGS_TAB_PAGE,
  payload: { projectId, settingsTab },
});

export const getTestItemPageLink = (projectId, testItemIds, itemType) => ({
  type: getItemLevel(itemType) === LEVEL_STEP ? PROJECT_LOG_PAGE : TEST_ITEM_PAGE,
  payload: {
    projectId,
    filterId: ALL,
    testItemIds,
  },
});
