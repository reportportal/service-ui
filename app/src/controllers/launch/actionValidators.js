import {
  userInfoSelector,
  userAccountRoleSelector,
  activeProjectRoleSelector,
} from 'controllers/user';
import { IN_PROGRESS } from 'common/constants/launchStatuses';
import { canMergeLaunches, canForceFinishLaunch } from 'common/utils/permissions';

export const validateMergeLaunch = (launch, launches, state) => {
  if (launches.length < 2) {
    return 'selectMoreItems';
  }
  const user = userInfoSelector(state);
  const userRole = userAccountRoleSelector(state);
  const projectRole = activeProjectRoleSelector(state);
  if (!canMergeLaunches(userRole, projectRole, launch.owner === user.userId)) {
    return 'notYourOwnLaunch';
  }
  if (launch.status && launch.status.toLowerCase() === IN_PROGRESS) {
    return 'launchNotInProgress';
  }
  if (launch.isProcessing) {
    return 'launchIsProcessing';
  }
  return null;
};

export const validateFinishForceLaunch = (launch, launches, state) => {
  if (launch.status && launch.status.toLowerCase() !== IN_PROGRESS) {
    return 'launchFinished';
  }
  const user = userInfoSelector(state);
  const userRole = userAccountRoleSelector(state);
  const projectRole = activeProjectRoleSelector(state);
  if (!canForceFinishLaunch(userRole, projectRole, launch.owner === user.userId)) {
    return 'notYourOwnLaunch';
  }
  return null;
};
