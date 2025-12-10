import { useSelector, useDispatch } from 'react-redux';
import { UserInfo, fetchUserInfoAction, idSelector } from 'controllers/user';
import { hideModalAction } from 'controllers/modal';
import { Organization, OrganizationType } from 'controllers/organization';
import { UPSA } from 'common/constants/accountType';
import { useUserPermissions } from 'hooks/useUserPermissions';

export const useCanUnassignOrganization = () => {
  const currentUserId = useSelector(idSelector) as number;
  const { canAssignUnassignInternalUser } = useUserPermissions();

  return (targetUser: UserInfo, targetOrganization: Organization) => {
    const { id: userId, accountType: userType } = targetUser;
    const { owner_id: ownerId, type: organizationType } = targetOrganization;
    const isCurrentUser = currentUserId === userId;
    const isUpsa = userType === UPSA;
    const isOrganizationOwner = userId === ownerId;

    if (organizationType === OrganizationType.EXTERNAL) {
      return (isCurrentUser || canAssignUnassignInternalUser) && !isUpsa;
    }

    if (organizationType === OrganizationType.PERSONAL) {
      return (isCurrentUser || canAssignUnassignInternalUser) && !isOrganizationOwner;
    }

    return isCurrentUser || canAssignUnassignInternalUser;
  };
};

export const useHandleUnassignSuccess = (user: Pick<UserInfo, 'id'>, onUnassign: () => void) => {
  const dispatch = useDispatch();
  const currentUserId = useSelector(idSelector) as number;

  return () => {
    if (currentUserId === user.id) {
      dispatch(fetchUserInfoAction());
    }

    dispatch(hideModalAction());
    onUnassign?.();
  };
};
