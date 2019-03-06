import {
  userInfoSelector,
  userAccountRoleSelector,
  activeProjectRoleSelector,
} from 'controllers/user';
import { launchSelector } from 'controllers/testItem';
import { IN_PROGRESS } from 'common/constants/launchStatuses';
import { canDeleteTestItem } from 'common/utils/permissions';

export const validateDeleteItem = (item, items, state) => {
  const user = userInfoSelector(state);
  const userRole = userAccountRoleSelector(state);
  const projectRole = activeProjectRoleSelector(state);
  const currentLaunch = launchSelector(state) || {};
  if (!canDeleteTestItem(userRole, projectRole, currentLaunch.owner === user.userId)) {
    return 'notYourOwnLaunch';
  }
  if (currentLaunch.status && currentLaunch.status.toLowerCase() === IN_PROGRESS) {
    return 'launchNotInProgress';
  }
  return null;
};
