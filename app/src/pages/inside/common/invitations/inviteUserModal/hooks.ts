/*
 * Copyright 2025 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useSelector, useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import DOMPurify from 'dompurify';
import { ssoUsersOnlySelector } from 'controllers/appInfo';
import { activeOrganizationIdSelector } from 'controllers/organization';
import { projectInfoIdSelector, projectNameSelector } from 'controllers/project';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { EDITOR, VIEWER } from 'common/constants/projectRoles';
import { messages } from 'common/constants/localization/invitationsLocalization';
import { showErrorNotification } from 'controllers/notification';
import { ApiError } from 'types/api';
import { FormDataMap, InvitationRequestData } from './types';
import { InviteUserProjectFormData } from './inviteUserProjectForm';
import { InviteUserOrganizationFormData } from './inviteUserOrganizationForm';
import { Organization } from '../../assignments/organizationAssignment';
import { ERROR_CODES, Level, settingsLink, settingsLinkName } from './constants';

export const useInviteUser = <L extends keyof FormDataMap>(level: L) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const projectName = useSelector(projectNameSelector);
  const ssoUsersOnly = useSelector(ssoUsersOnlySelector);
  const organizationId = useSelector(activeOrganizationIdSelector) as number;
  const projectId = useSelector(projectInfoIdSelector);

  const okButtonTitle = formatMessage(
    ssoUsersOnly ? COMMON_LOCALE_KEYS.ASSIGN : COMMON_LOCALE_KEYS.INVITE,
  );

  const getHeader = () => {
    if (level === Level.PROJECT) {
      const message = ssoUsersOnly ? messages.assignUserTo : messages.inviteUserTo;

      return `${formatMessage(message)} ${projectName}`;
    }

    const message = ssoUsersOnly ? messages.assignUser : messages.inviteUser;

    return formatMessage(message);
  };

  const buildOrganizationsData = (orgs: Organization[]) => {
    return orgs.map(({ name: _orgName, role, projects, ...orgRest }) => ({
      ...orgRest,
      org_role: role,
      projects: projects?.map(({ name: _projName, role: projectRole, ...projectRest }) => ({
        ...projectRest,
        project_role: projectRole,
      })),
    }));
  };

  const buildUserData = (formData: FormDataMap[L]) => {
    const { email } = formData;
    let organizations = [];

    if (level === Level.PROJECT) {
      const projectData = formData as InviteUserProjectFormData;

      organizations = [
        {
          id: organizationId,
          projects: [
            {
              id: projectId,
              project_role: projectData.canEdit ? EDITOR : VIEWER,
            },
          ],
        },
      ];
    }

    if (level === Level.ORGANIZATION) {
      const organizationData = formData as InviteUserOrganizationFormData;

      organizations = buildOrganizationsData([organizationData.organization]);
    }

    return { email, organizations };
  };

  const handleError = (err: ApiError, userData: InvitationRequestData) => {
    const { errorCode, message: errMessage } = err;
    const externalInviteForbidden = errorCode === ERROR_CODES.FORBIDDEN && ssoUsersOnly;
    const epamInviteForbidden = errorCode === ERROR_CODES.EPAM_FORBIDDEN;
    const duplicatedInvite = errorCode === ERROR_CODES.DUPLICATION;
    let message = errMessage;

    if (duplicatedInvite) {
      message = formatMessage(
        level === Level.PROJECT ? messages.duplicationProject : messages.duplicationOrganization,
      );
    }

    if (epamInviteForbidden) {
      message = formatMessage(messages.epamInviteForbidden);
    }

    if (externalInviteForbidden) {
      message = formatMessage(messages.externalInviteForbidden, {
        email: userData.email,
        linkName: settingsLinkName,
        a: (innerData) =>
          DOMPurify.sanitize(
            `<a href="${settingsLink}" target="_blank" rel="noopener">${innerData.join()}</a>`,
            { ADD_ATTR: ['target'] },
          ),
      });
    }

    dispatch(showErrorNotification({ message }));
  };

  return {
    header: getHeader(),
    okButtonTitle,
    buildUserData,
    handleError,
  };
};
