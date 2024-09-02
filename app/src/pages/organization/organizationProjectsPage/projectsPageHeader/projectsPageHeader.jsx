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
import { Button, PlusIcon, FieldText } from '@reportportal/ui-kit';
import classNames from 'classnames/bind';
import { PROJECTS_PAGE } from 'controllers/pages';
import searchIcon from 'common/img/newIcons/search-outline-inline.svg';
import filterIcon from 'common/img/newIcons/filters-outline-inline.svg';
import { Breadcrumbs } from 'componentLibrary/breadcrumbs';
import { activeOrganizationSelector } from 'controllers/organizations/organization';
import { SEARCH_KEY } from 'controllers/organizations/projects/constants';
import { loadingSelector } from 'controllers/organizations/projects';
import { useEffect, useState } from 'react';
import { withFilter } from 'controllers/filter';
import projectsIcon from './img/projects-inline.svg';
import styles from './projectsPageHeader.scss';
import { messages } from '../messages';
import userIcon from './img/user-inline.svg';

const cx = classNames.bind(styles);

export const ProjectsPageHeaderWrapped = ({
  filter,
  onFilterChange,
  hasPermission,
  onCreateProject,
  searchValue,
  setSearchValue,
}) => {
  const { formatMessage } = useIntl();
  const organization = useSelector(activeOrganizationSelector);
  const organizationName = organization?.name;
  const projectsCount = organization?.relationships?.projects?.meta.count;
  const usersCount = organization?.relationships?.users?.meta.count;
  const isNotEmpty = projectsCount > 0;
  const projectsLoading = useSelector(loadingSelector);
  const [isSearchActive, setIsSearchActive] = useState(false);

  const breadcrumbs = [
    {
      title: formatMessage(messages.allOrganizations),
      link: { type: PROJECTS_PAGE },
    },
    {
      title: organizationName,
    },
  ];

  const handleSearchChange = (e, onChange) => {
    const newValue = e.target.value;
    setSearchValue(newValue);
    onChange(newValue);
  };

  const handleSearchClear = (onChange) => {
    setSearchValue('');
    onChange('');
  };

  useEffect(() => {
    if (searchValue === null && filter) setSearchValue(filter);
  }, []);

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
              <FieldText
                value={searchValue ?? filter ?? ''}
                onChange={(e) => handleSearchChange(e, onFilterChange)}
                onClear={() => handleSearchClear(onFilterChange)}
                onFocus={() => setIsSearchActive(true)}
                onBlur={() => setIsSearchActive(false)}
                placeholder={formatMessage(messages.searchPlaceholder)}
                loading={isSearchActive && projectsLoading}
                startIcon={Parser(searchIcon)}
                className={cx('search-input')}
                collapsible
                clearable
              />
              <i className={cx('filters-icon')}>{Parser(filterIcon)}</i>
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

ProjectsPageHeaderWrapped.propTypes = {
  hasPermission: PropTypes.bool,
  onCreateProject: PropTypes.func.isRequired,
  searchValue: PropTypes.string || null,
  setSearchValue: PropTypes.func.isRequired,
  filter: PropTypes.string,
  onFilterChange: PropTypes.func.isRequired,
};

ProjectsPageHeaderWrapped.defaultProps = {
  hasPermission: false,
};
export const ProjectsPageHeader = withFilter({ filterKey: SEARCH_KEY })(ProjectsPageHeaderWrapped);
