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

import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { Table } from '@reportportal/ui-kit';
import classNames from 'classnames/bind';
import { useDispatch, useSelector } from 'react-redux';
import { AbsRelTime } from 'components/main/absRelTime';
import { SORTING_ASC, withSortingURL } from 'controllers/sorting';
import { DEFAULT_PAGINATION, PAGE_KEY, withPagination } from 'controllers/pagination';
import { PaginationWrapper } from 'components/main/paginationWrapper';
import {
  activeOrganizationSelector,
  prepareActiveOrganizationProjectsAction,
} from 'controllers/organization';
import {
  DEFAULT_LIMITATION,
  DEFAULT_PAGE_SIZE_OPTIONS,
  DEFAULT_SORT_COLUMN,
  projectsPaginationSelector,
  SORTING_KEY,
} from 'controllers/organization/projects';
import { NAMESPACE } from 'controllers/organization/projects/constants';
import { ProjectActionMenu } from 'pages/organization/organizationProjectsPage/projectsListTable/projectActionMenu';
import { messages } from '../messages';
import { ProjectName } from './projectName';
import styles from './projectsListTable.scss';

const cx = classNames.bind(styles);

export function ProjectsListTable({
  projects,
  sortingDirection,
  onChangeSorting,
  pageSize,
  activePage,
  itemCount,
  pageCount,
  onChangePage,
  onChangePageSize,
}) {
  const { formatMessage } = useIntl();
  const organizationSlug = useSelector(activeOrganizationSelector)?.slug;
  const dispatch = useDispatch();
  const onTableColumnSort = ({ key }) => {
    onChangeSorting(key);
    dispatch(prepareActiveOrganizationProjectsAction());
  };
  const data = useMemo(
    () =>
      projects.map((project) => {
        const lastLaunch = project.stats.launch_stats.last_occurred_at;
        const metaData = {
          projectName: project.name,
          projectSlug: project.slug,
          projectKey: project.key,
          projectId: project.id,
          projectRole: project.role,
          organizationSlug,
        };
        return {
          id: project.id,
          name: {
            content: project.name,
            component: (
              <div className={cx('project-name-col')}>
                <ProjectName project={metaData} />
              </div>
            ),
          },
          usersCount: project.stats.user_stats.total_count,
          launchesCount: project.stats.launch_stats.total_count,
          lastLaunch: {
            content: lastLaunch,
            component: lastLaunch ? (
              <AbsRelTime startTime={lastLaunch} customClass={cx('date')} />
            ) : (
              <span>n/a</span>
            ),
          },
          metaData,
        };
      }),
    [projects, organizationSlug],
  );

  const primaryColumn = {
    key: 'name',
    header: formatMessage(messages.projectName),
  };

  const fixedColumns = [
    {
      key: 'usersCount',
      header: formatMessage(messages.teammates),
      width: 100,
      align: 'right',
    },
    {
      key: 'launchesCount',
      header: formatMessage(messages.launches),
      width: 100,
      align: 'right',
    },
    {
      key: 'lastLaunch',
      header: formatMessage(messages.lastLaunch),
      width: 156,
    },
  ];

  return (
    <PaginationWrapper
      showPagination={projects.length > 0}
      pageSize={pageSize}
      activePage={activePage}
      totalItems={itemCount}
      totalPages={pageCount}
      pageSizeOptions={DEFAULT_PAGE_SIZE_OPTIONS}
      changePage={onChangePage}
      changePageSize={onChangePageSize}
      className={cx('projects-pagination-wrapper')}
    >
      <Table
        data={data}
        primaryColumn={primaryColumn}
        fixedColumns={fixedColumns}
        sortingDirection={sortingDirection.toLowerCase()}
        sortingColumn={primaryColumn}
        sortableColumns={primaryColumn.key}
        renderRowActions={(metaData) => <ProjectActionMenu details={metaData} />}
        className={cx('projects-list-table')}
        onChangeSorting={onTableColumnSort}
      />
    </PaginationWrapper>
  );
}

ProjectsListTable.propTypes = {
  projects: PropTypes.array,
  sortingDirection: PropTypes.string,
  onChangeSorting: PropTypes.func,
  pageSize: PropTypes.number,
  activePage: PropTypes.number,
  itemCount: PropTypes.number.isRequired,
  pageCount: PropTypes.number.isRequired,
  onChangePage: PropTypes.func.isRequired,
  onChangePageSize: PropTypes.func.isRequired,
};

ProjectsListTable.defaultProps = {
  projects: [],
  activePage: DEFAULT_PAGINATION[PAGE_KEY],
  pageSize: DEFAULT_LIMITATION,
};

export const ProjectsListTableWrapper = withSortingURL({
  defaultFields: [DEFAULT_SORT_COLUMN],
  defaultDirection: SORTING_ASC,
  sortingKey: SORTING_KEY,
  namespace: NAMESPACE,
})(
  withPagination({
    paginationSelector: projectsPaginationSelector,
    namespace: NAMESPACE,
  })(ProjectsListTable),
);
