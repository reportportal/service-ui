/*
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

import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import Parser from 'html-react-parser';
import { Button, PlusIcon } from '@reportportal/ui-kit';
import classNames from 'classnames/bind';
import { ORGANIZATIONS_PAGE } from 'controllers/pages';
import { Breadcrumbs } from 'componentLibrary/breadcrumbs';
import { activeOrganizationSelector } from 'controllers/organization';
import { loadingSelector } from 'controllers/organization/projects';
import { SearchField } from 'components/fields/searchField';
import { SEARCH_KEY, NAMESPACE } from 'controllers/organization/projects/constants';
import { withFilter } from 'controllers/filter';
import { createFilterEntitiesURLContainer } from 'components/filterEntities/containers';
import { PROJECTS_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/projectsPageEvents';
import { ProjectsFilter } from './projectsFilter';
import projectsIcon from './img/projects-inline.svg';
import userIcon from './img/user-inline.svg';
import { messages } from '../messages';
import styles from './projectsPageHeader.scss';

const cx = classNames.bind(styles);

const SearchFieldWithFilter = withFilter({ filterKey: SEARCH_KEY, namespace: NAMESPACE })(
  SearchField,
);

const FilterEntitiesURLContainer = createFilterEntitiesURLContainer(null, NAMESPACE);

export const ProjectsPageHeader = ({
  hasPermission,
  onCreateProject,
  searchValue,
  setSearchValue,
  appliedFiltersCount,
  setAppliedFiltersCount,
}) => {
  const { formatMessage } = useIntl();
  const organization = useSelector(activeOrganizationSelector);
  const organizationName = organization?.name;
  const projectsCount = organization?.relationships?.projects?.meta.count;
  const usersCount = organization?.relationships?.users?.meta.count;
  const isNotEmpty = projectsCount > 0;
  const projectsLoading = useSelector(loadingSelector);

  const breadcrumbs = [
    {
      title: formatMessage(messages.allOrganizations),
      link: { type: ORGANIZATIONS_PAGE },
    },
    {
      title: organizationName,
    },
  ];

  return (
    <div className={cx('projects-page-header-container')}>
      <div className={cx('top-breadcrumbs')}>
        <Breadcrumbs descriptors={breadcrumbs} />
      </div>
      <div className={cx('header')}>
        <div className={cx('main-content')}>
          <span className={cx('title')}>{organizationName}</span>
          {isNotEmpty && hasPermission && (
            <div className={cx('details')}>
              <div className={cx('details-item')}>
                <i className={cx('details-item-icon')}>{Parser(projectsIcon)}</i>
                <span>{formatMessage(messages.projects)}:</span>
                <b>{projectsCount}</b>
              </div>
              <div className={cx('details-item')}>
                <i className={cx('details-item-icon')}>{Parser(userIcon)}</i>
                <span>{formatMessage(messages.users)}:</span>
                <b>{usersCount}</b>
              </div>
            </div>
          )}
        </div>
        <div className={cx('actions')}>
          {isNotEmpty && (
            <div className={cx('icons')}>
              <SearchFieldWithFilter
                isLoading={projectsLoading}
                searchValue={searchValue}
                setSearchValue={setSearchValue}
                placeholder={formatMessage(messages.searchPlaceholder)}
                event={PROJECTS_PAGE_EVENTS.SEARCH_PROJECTS_FIELD}
              />
              <FilterEntitiesURLContainer
                debounced={false}
                additionalFilter="name"
                render={({ entities, onChange }) => (
                  <ProjectsFilter
                    appliedFiltersCount={appliedFiltersCount}
                    setAppliedFiltersCount={setAppliedFiltersCount}
                    entities={entities}
                    onFilterChange={onChange}
                  />
                )}
              />
            </div>
          )}
          {isNotEmpty && hasPermission && (
            <Button variant={'ghost'} icon={<PlusIcon />} onClick={onCreateProject}>
              {formatMessage(messages.createProject)}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

ProjectsPageHeader.propTypes = {
  hasPermission: PropTypes.bool,
  onCreateProject: PropTypes.func.isRequired,
  searchValue: PropTypes.string || null,
  setSearchValue: PropTypes.func.isRequired,
  appliedFiltersCount: PropTypes.number,
  setAppliedFiltersCount: PropTypes.func,
};

ProjectsPageHeader.defaultProps = {
  hasPermission: false,
};
