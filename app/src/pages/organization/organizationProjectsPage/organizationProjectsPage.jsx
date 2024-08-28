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

import { useDispatch, useSelector } from 'react-redux';
import { canCreateProject } from 'common/utils/permissions';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { BubblesLoader, PlusIcon } from '@reportportal/ui-kit';
import { useIntl } from 'react-intl';
import { loadingSelector, projectsSelector } from 'controllers/organizations/projects/selectors';
import { activeOrganizationLoadingSelector } from 'controllers/organizations/organization/selectors';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { userRolesSelector } from 'controllers/pages';
import { showModalAction } from 'controllers/modal';
import { createProjectAction } from 'controllers/organizations/projects/actionCreators';
import { ProjectsPageHeader } from './projectsPageHeader';
import { EmptyPageState } from '../emptyPageState';
import EmptyIcon from './img/empty-projects-icon-inline.svg';
import { messages } from './messages';
import { ProjectsListTableWrapper } from './projectsListTable';
import styles from './organizationProjectsPage.scss';

const cx = classNames.bind(styles);

export const OrganizationProjectsPage = () => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const userRoles = useSelector(userRolesSelector);
  const hasPermission = canCreateProject(userRoles);
  const organizationLoading = useSelector(activeOrganizationLoadingSelector);
  const projectsLoading = useSelector(loadingSelector);
  const permissionSuffix = hasPermission ? 'WithPermission' : 'WithoutPermission';
  const label = formatMessage(messages[`noProjects${permissionSuffix}`]);
  const description = Parser(formatMessage(messages[`noProjectsList${permissionSuffix}`]));
  const buttonTitle = formatMessage(messages.createProject);

  const projects = useSelector(projectsSelector);
  const isProjectsEmpty = !projectsLoading && projects.length === 0;

  const showCreateProjectModal = () => {
    dispatch(
      showModalAction({
        id: 'addProjectModal',
        data: {
          onSubmit: (newProjectName) => {
            dispatch(
              createProjectAction({
                newProjectName,
              }),
            );
          },
          projects: projects.map((project) => ({
            name: project.name,
            id: project.id,
            slug: project.slug,
          })),
        },
      }),
    );
  };

  const getEmptyPageState = () => {
    organizationLoading ? (
      <div className={cx('loader')}>
        <BubblesLoader />
      </div>
    ) : (
      <EmptyPageState
        hasPermission={hasPermission}
        label={label}
        description={description}
        icon={<PlusIcon />}
        buttonTitle={buttonTitle}
        emptyIcon={EmptyIcon}
        onClick={showCreateProjectModal}
      />
    );
  };

  return (
    <ScrollWrapper autoHeightMax={100}>
      <div className={cx('organization-projects-container')}>
        <>
          <ProjectsPageHeader
            hasPermission={hasPermission}
            onCreateProject={showCreateProjectModal}
          />
          {isProjectsEmpty ? getEmptyPageState() : <ProjectsListTableWrapper projects={projects} />}
        </>
      </div>
    </ScrollWrapper>
  );
};
