import {
  userInfoSelector,
  userAccountRoleSelector,
  activeProjectRoleSelector,
} from 'controllers/user';
import { canDeleteUser } from 'common/utils/permissions';

export const validateDeleteUser = (user, users, state) => {
  const activeUser = userInfoSelector(state);
  const userRole = userAccountRoleSelector(state);
  const projectRole = activeProjectRoleSelector(state);
  if (!canDeleteUser(userRole, projectRole, user.id !== activeUser.id)) {
    return 'cantDeleteYourSelf';
  }
  return null;
};
