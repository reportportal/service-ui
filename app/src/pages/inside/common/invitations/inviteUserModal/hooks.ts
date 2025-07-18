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

import { useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { ssoUsersOnlySelector } from 'controllers/appInfo';
import { activeOrganizationIdSelector } from 'controllers/organization';
import { projectInfoIdSelector, projectNameSelector } from 'controllers/project';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { EDITOR, VIEWER } from 'common/constants/projectRoles';
import { messages } from 'common/constants/localization/invitationsLocalization';
import { FormDataMap } from './types';
import { InviteUserProjectFormData } from './inviteUserProjectForm';
import { InviteUserOrganizationFormData } from './inviteUserOrganizationForm';
import { Organization } from '../../assignments/organizationAssignment';
import { Level } from './constants';

export const useInviteUser = <L extends keyof FormDataMap>(level: L) => {
  const { formatMessage } = useIntl();
  const projectName = useSelector(projectNameSelector) as string;
  const ssoUsersOnly = useSelector(ssoUsersOnlySelector);
  const organizationId = useSelector(activeOrganizationIdSelector) as number;
  const projectId = useSelector(projectInfoIdSelector) as number;

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

  return {
    header: getHeader(),
    okButtonTitle,
    buildUserData,
  };
};
