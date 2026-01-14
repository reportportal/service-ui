/*!
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

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { BubblesLoader, PlusIcon } from '@reportportal/ui-kit';
import { useIntl } from 'react-intl';
import {
  loadingSelector,
  projectsSelector,
  projectsPaginationSelector,
} from 'controllers/organization/projects/selectors';
import { activeOrganizationLoadingSelector } from 'controllers/organization/selectors';
import { showModalAction } from 'controllers/modal';
import { createProjectAction } from 'controllers/organization/projects/actionCreators';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { EmptyPageState } from 'pages/common';
import NoResultsIcon from 'common/img/newIcons/no-results-icon-inline.svg';
import { assignedProjectsSelector } from 'controllers/user';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { ProjectsPageHeader } from './projectsPageHeader';
import EmptyIcon from './img/empty-projects-icon-inline.svg';
import { messages } from './messages';
import { ProjectsListTable } from './projectsListTable';
import { withPagination } from 'controllers/pagination';
import { withSortingURL, SORTING_ASC } from 'controllers/sorting';
import {
  NAMESPACE,
  DEFAULT_SORT_COLUMN,
  SORTING_KEY,
} from 'controllers/organization/projects/constants';
import styles from './organizationProjectsPage.scss';

const cx = classNames.bind(styles);

const OrganizationProjectsPageComponent = ({
  sortingDirection,
  onChangeSorting,
  pageSize,
  activePage,
  itemCount,
  pageCount,
  onChangePage,
  onChangePageSize,
}) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const { canCreateProject } = useUserPermissions();
  const organizationLoading = useSelector(activeOrganizationLoadingSelector);
  const projectsLoading = useSelector(loadingSelector);
  const permissionSuffix = canCreateProject ? 'WithPermission' : 'WithoutPermission';
  const label = formatMessage(messages[`noProjects${permissionSuffix}`]);
  const description = Parser(formatMessage(messages[`noProjectsList${permissionSuffix}`]));
  const buttonTitle = formatMessage(messages.createProject);

  const projects = useSelector(projectsSelector);
  const assignedProjects = useSelector(assignedProjectsSelector);

  const projectsWithAssignedRoles = projects.map((project) => {
    const assignedProject = Object.values(assignedProjects || {}).find(
      (assigned) => assigned.projectSlug === project.slug,
    );

    return {
      ...project,
      role: assignedProject?.projectRole,
    };
  });

  const [searchValue, setSearchValue] = useState(null);
  const [appliedFiltersCount, setAppliedFiltersCount] = useState(0);

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
    return searchValue === null && appliedFiltersCount === 0 ? (
      <EmptyPageState
        hasPermission={canCreateProject}
        label={label}
        description={description}
        icon={<PlusIcon />}
        buttonTitle={buttonTitle}
        emptyIcon={EmptyIcon}
        onClick={showCreateProjectModal}
      />
    ) : (
      <EmptyPageState
        label={formatMessage(COMMON_LOCALE_KEYS.NO_RESULTS)}
        description={formatMessage(messages.noResultsDescription)}
        emptyIcon={NoResultsIcon}
        hasPermission={false}
      />
    );
  };

  const renderContent = () => {
    if (organizationLoading || projectsLoading) {
      return (
        <div className={cx('loader')}>
          <BubblesLoader />
        </div>
      );
    }

    if (itemCount === 0) {
      return getEmptyPageState();
    }

    return (
      <ProjectsListTable
        projects={projectsWithAssignedRoles}
        sortingDirection={sortingDirection}
        onChangeSorting={onChangeSorting}
        pageSize={pageSize}
        activePage={activePage}
        itemCount={itemCount}
        pageCount={pageCount}
        onChangePage={onChangePage}
        onChangePageSize={onChangePageSize}
      />
    );
  };

  return (
    <div className={cx('organization-projects-container')}>
      <ProjectsPageHeader
        hasPermission={canCreateProject}
        onCreateProject={showCreateProjectModal}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        appliedFiltersCount={appliedFiltersCount}
        setAppliedFiltersCount={setAppliedFiltersCount}
      />
      {renderContent()}
    </div>
  );
};

OrganizationProjectsPageComponent.propTypes = {
  sortingDirection: PropTypes.string,
  onChangeSorting: PropTypes.func,
  pageSize: PropTypes.number,
  activePage: PropTypes.number,
  itemCount: PropTypes.number,
  pageCount: PropTypes.number,
  onChangePage: PropTypes.func,
  onChangePageSize: PropTypes.func,
};

export const OrganizationProjectsPage = withSortingURL({
  defaultFields: [DEFAULT_SORT_COLUMN],
  defaultDirection: SORTING_ASC,
  sortingKey: SORTING_KEY,
  namespace: NAMESPACE,
})(
  withPagination({
    paginationSelector: projectsPaginationSelector,
    namespace: NAMESPACE,
  })(OrganizationProjectsPageComponent),
);
