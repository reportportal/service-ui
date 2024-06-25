/*!
 * Copyright 2024 EPAM Systems
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
import { userRolesSelector } from 'controllers/user';
import { canCreateProject } from 'common/utils/permissions';
import classNames from 'classnames/bind';
import { BubblesLoader } from '@reportportal/ui-kit';
import { organizationLoadingSelector } from 'controllers/organizations/organization/selectors';
import { projectsPaginationSelector } from 'controllers/organizations/projects/selectors';
import { ProjectsListTableWrapper } from './projectsListTable';
import { ProjectsPageHeader } from './header';
import { EmptyProjectsState } from './emptyProjectsState';
import styles from './organizationProjectsPage.scss';

const cx = classNames.bind(styles);

export const OrganizationProjectsPage = () => {
  const userRoles = useSelector(userRolesSelector);
  const hasPermission = canCreateProject(userRoles);
  const { items: projects } = useSelector(projectsPaginationSelector);
  const organizationLoading = useSelector(organizationLoadingSelector);

  const isProjectsEmpty = projects?.length === 0;
  return (
    <div className={cx('organization-projects-container')}>
      {organizationLoading ? (
        <div className={cx('loader')}>
          <BubblesLoader />
        </div>
      ) : (
        <>
          <ProjectsPageHeader hasPermission={hasPermission} />
          {isProjectsEmpty ? (
            <EmptyProjectsState hasPermission={hasPermission} />
          ) : (
            <ProjectsListTableWrapper projects={projects} />
          )}
        </>
      )}
    </div>
  );
};
