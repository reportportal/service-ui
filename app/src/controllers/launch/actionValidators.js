import { activeProjectSelector, userInfoSelector, isAdminSelector } from 'controllers/user';
import { IN_PROGRESS } from 'common/constants/launchStatuses';

const isAdminOrProjectManager = (state) => {
  const user = userInfoSelector(state);
  const activeProject = activeProjectSelector(state);
  return (
    isAdminSelector(state) ||
    user.assigned_projects[activeProject].projectRole === 'PROJECT_MANAGER'
  );
};

export const validateMergeLaunch = (launch, launches, state) => {
  if (launches.length < 2) {
    return 'selectMoreItems';
  }
  const user = userInfoSelector(state);
  if (launch.owner !== user.userId && !isAdminOrProjectManager(state)) {
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
