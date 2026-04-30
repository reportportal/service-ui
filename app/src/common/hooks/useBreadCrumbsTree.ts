/*
 * Copyright 2026 EPAM Systems
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

import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';

import {
  ORGANIZATION_PROJECTS_PAGE,
  ORGANIZATIONS_PAGE,
  PROJECT_DASHBOARD_PAGE,
  urlOrganizationAndProjectSelector,
} from 'controllers/pages';
import { activeOrganizationNameSelector } from 'controllers/organization';
import { projectNameSelector } from 'controllers/project';
import { ProjectDetails } from 'pages/organization/constants';
import { messages } from 'pages/organization/messages';

interface BreadcrumbTreeNode {
  title: string;
  link: object;
  children?: BreadcrumbTreeNode[];
}

export const useBreadCrumbsTree = (): BreadcrumbTreeNode[] => {
  const { formatMessage } = useIntl();
  const organizationName = useSelector(activeOrganizationNameSelector);
  const { organizationSlug, projectSlug } = useSelector(
    urlOrganizationAndProjectSelector,
  ) as ProjectDetails;
  const projectName = useSelector(projectNameSelector);

  return useMemo(() => {
    const rootCrumb: BreadcrumbTreeNode = {
      title: formatMessage(messages.allOrganizations),
      link: { type: ORGANIZATIONS_PAGE },
      children: [],
    };

    if (organizationSlug) {
      const organizationCrumb: BreadcrumbTreeNode = {
        title: organizationName,
        link: { type: ORGANIZATION_PROJECTS_PAGE, payload: { organizationSlug } },
        children: [],
      };
      rootCrumb.children = [organizationCrumb];

      if (projectSlug) {
        organizationCrumb.children = [
          {
            title: projectName,
            link: { type: PROJECT_DASHBOARD_PAGE, payload: { organizationSlug, projectSlug } },
          },
        ];
      }
    }

    return [rootCrumb];
  }, [formatMessage, organizationName, organizationSlug, projectSlug, projectName]);
};
