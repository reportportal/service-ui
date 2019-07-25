import { PROJECT_SETTINGS_TAB_PAGE, TEST_ITEM_PAGE } from 'controllers/pages';
import { ALL } from 'common/constants/reservedFilterIds';

export const getProjectSettingTabPageLink = (projectId, settingsTab) => ({
  type: PROJECT_SETTINGS_TAB_PAGE,
  payload: { projectId, settingsTab },
});

export const getTestItemPageLink = (projectId, testItemIds) => ({
  type: TEST_ITEM_PAGE,
  payload: {
    projectId,
    filterId: ALL,
    testItemIds,
  },
});
