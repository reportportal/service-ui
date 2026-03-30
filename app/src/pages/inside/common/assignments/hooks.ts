import { useSelector, useDispatch } from 'react-redux';
import { MessageDescriptor } from 'react-intl';
import { UserInfo, fetchUserInfoAction, idSelector } from 'controllers/user';
import { hideModalAction } from 'controllers/modal';
import { Organization, OrganizationType } from 'controllers/organization';
import { UPSA } from 'common/constants/accountType';
import { messages as assignmentMessages } from 'common/constants/localization/assignmentsLocalization';
import { useUserPermissions } from 'hooks/useUserPermissions';

export interface AssignmentsUtilsParams {
  currentUserId: number;
  userId: number | null | undefined;
  userType: string | undefined;
  organizationType: OrganizationType | undefined;
  ownerId: number | undefined;
}

export interface AssignmentsUtilsResult {
  unassignTooltip: MessageDescriptor | null;
}

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

export const useAssignmentsUtils = ({
  currentUserId,
  userId,
  userType,
  organizationType,
  ownerId,
}: AssignmentsUtilsParams): AssignmentsUtilsResult => {
  const isUpsaUser = userType === UPSA;
  const isExternalOrg = organizationType === OrganizationType.EXTERNAL;
  const isPersonalOrg = organizationType === OrganizationType.PERSONAL;
  const isOrganizationOwner = userId != null && userId === ownerId;
  const isCurrentUser = currentUserId === userId;

  if (isCurrentUser) {
    return {
      unassignTooltip:
        isPersonalOrg && isOrganizationOwner
          ? assignmentMessages.unassignPersonalOwnerSelfMessage
          : assignmentMessages.unassignSelfMessage,
    };
  }

  if (isUpsaUser && isExternalOrg) {
    return {
      unassignTooltip: assignmentMessages.unassignUpsaMessage,
    };
  }

  if (isPersonalOrg && isOrganizationOwner) {
    return {
      unassignTooltip: assignmentMessages.unassignPersonalOwnerMessage,
    };
  }

  return { unassignTooltip: null };
};
