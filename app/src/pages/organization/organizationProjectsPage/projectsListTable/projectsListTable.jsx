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

import { useMemo, useState } from 'react';
import { BubblesLoader, MeatballMenuIcon, Popover, Table } from '@reportportal/ui-kit';
import classNames from 'classnames/bind';
import { useDispatch, useSelector } from 'react-redux';
import {
  activeOrganizationSelector,
  fetchOrganizationProjectsAction,
} from 'controllers/organizations/organization';
import { ProjectName } from 'pages/admin/projectsPage/projectName';
import { AbsRelTime } from 'components/main/absRelTime';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { loadingSelector, projectsPaginationSelector } from 'controllers/administrate/projects';
import { messages } from '../messages';
import styles from './projectsListTable.scss';

const cx = classNames.bind(styles);
export const ProjectsListTable = ({ projects }) => {
  const { formatMessage } = useIntl();
  const [checkedRows, setCheckedRows] = useState(new Set([]));
  const organizationSlug = useSelector(activeOrganizationSelector).slug;
  const loadingState = useSelector(loadingSelector);
  const { order: sortingDirection } = useSelector(projectsPaginationSelector);
  const dispatch = useDispatch();

  const onTableColumnSort = ({ key, direction }) => {
    const updatedDirection = direction === 'asc' ? 'desc' : 'asc';

    if (key === 'name') {
      dispatch(
        fetchOrganizationProjectsAction({
          prefParam: {
            order: updatedDirection.toUpperCase(),
            sort: key,
          },
        }),
      );
    }
  };
  const data = useMemo(
    () =>
      projects.map((project) => {
        const lastLaunch = project.relationships.launches.meta.last_occurred_at;
        return {
          id: project.id,
          name: {
            content: project.name,
            component: (
              <div className={cx('project-name-col')}>
                <ProjectName
                  project={{
                    projectName: project.name,
                    projectSlug: project.slug,
                    organizationSlug,
                  }}
                />
              </div>
            ),
          },
          usersCount: project.relationships.users.meta.count,
          launchesCount: project.relationships.launches.meta.count,
          lastLaunch: {
            content: lastLaunch,
            component: lastLaunch ? (
              <AbsRelTime startTime={lastLaunch} customClass={cx('date')} />
            ) : (
              <span>n/a</span>
            ),
          },
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

  const rowActionMenu = (
    <Popover
      placement={'bottom-end'}
      content={
        <div className={cx('row-action-dropdown')}>
          <p className={cx('rename')}>Edit</p>
          <p className={cx('delete')}>Rename</p>
        </div>
      }
    >
      <i className={cx('menu-icon')}>
        <MeatballMenuIcon />
      </i>
    </Popover>
  );

  return loadingState ? (
    <div className={cx('loader')}>
      <BubblesLoader />
    </div>
  ) : (
    <Table
      data={data}
      primaryColumn={primaryColumn}
      fixedColumns={fixedColumns}
      selectable
      sortingDirection={sortingDirection.toLowerCase()}
      sortingColumn={primaryColumn}
      rowActionMenu={rowActionMenu}
      className={cx('projects-list-table')}
      onToggleRowSelection={(id) => {
        const newCheckedRows = new Set(checkedRows);
        if (newCheckedRows.has(id)) {
          newCheckedRows.delete(id);
        } else {
          newCheckedRows.add(id);
        }
        setCheckedRows(newCheckedRows);
      }}
      onToggleAllRowsSelection={() => {
        if (checkedRows.size === data.length) {
          setCheckedRows(new Set());
        } else {
          const allRows = new Set(data.map((item) => item.id));
          setCheckedRows(allRows);
        }
      }}
      selectedRowIds={[...checkedRows]}
      onChangeSorting={onTableColumnSort}
    />
  );
};

ProjectsListTable.propTypes = {
  projects: PropTypes.array,
};
ProjectsListTable.defaultProps = {
  projects: [],
};
