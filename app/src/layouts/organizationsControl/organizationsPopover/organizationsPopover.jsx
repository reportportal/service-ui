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

import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl, defineMessages } from 'react-intl';
import { FieldText, SearchIcon, ThemeProvider } from '@reportportal/ui-kit';
import classNames from 'classnames/bind';
import { useSelector } from 'react-redux';
import { availableProjectsSelector } from 'controllers/user';
import {
  urlProjectSlugSelector,
  urlOrganizationSlugSelector,
  ORGANIZATIONS_PAGE,
} from 'controllers/pages';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { NavLink } from 'components/main/navLink';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { SIDEBAR_EVENTS } from 'components/main/analytics/events';
import { useTracking } from 'react-tracking';
import { locationSelector } from 'controllers/pages/selectors';
import routesMap from 'routes/routesMap';
import { OrganizationsItem } from './organizationsItem';
import styles from './organizationsPopover.scss';

const cx = classNames.bind(styles);
const MARGIN_TOP_AND_MARGIN_BOTTOM = 172;

export const messages = defineMessages({
  allOrganizations: {
    id: 'OrganizationsControl.allOrganizations',
    defaultMessage: 'All organizations',
  },
  assignmentsList: {
    id: 'OrganizationsControl.assignmentsList',
    defaultMessage: 'Assignments list',
  },
  noAssignments: {
    id: 'OrganizationsControl.noAssignments',
    defaultMessage: 'No assignments',
  },
});

export const OrganizationsPopover = ({ closePopover, closeSidebar }) => {
  const { formatMessage } = useIntl();
  const availableProjects = useSelector(availableProjectsSelector);
  const currentOrganization = useSelector(urlOrganizationSlugSelector);
  const projectSlug = useSelector(urlProjectSlugSelector);
  const [valueSearch, setValueSearch] = useState('');
  const [isSearchEventTriggered, setIsSearchEventTriggered] = useState(false);
  const { trackEvent } = useTracking();
  const maxHeightPopover = window.innerHeight - MARGIN_TOP_AND_MARGIN_BOTTOM;
  const location = useSelector(locationSelector);
  const isAllOrganizationPage = location.pathname === routesMap.ORGANIZATIONS_PAGE.path;

  const filteredProjects = useMemo(
    () =>
      availableProjects.reduce((acc, { organizationSlug, organizationName, projects }) => {
        const isOrganization = organizationName.toLowerCase().includes(valueSearch.toLowerCase());
        const searchProjects = projects.filter(({ projectName }) =>
          projectName.toLowerCase().includes(valueSearch.toLowerCase()),
        );

        return isOrganization || searchProjects.length > 0
          ? [
              ...acc,
              {
                organizationSlug,
                organizationName,
                projects: searchProjects,
              },
            ]
          : acc;
      }, []),
    [valueSearch, availableProjects],
  );

  const onClose = () => {
    closeSidebar();
    closePopover();
  };

  const handleChange = (event) => {
    const value = event.target.value;
    setValueSearch(value);

    if (value.length && !isSearchEventTriggered) {
      trackEvent(SIDEBAR_EVENTS.SEARCH_ORGANIZATION_PROJECTS);
      setIsSearchEventTriggered(true);
    }
  };

  const handleClear = () => {
    setValueSearch('');
  };

  return (
    <div className={cx('organizations-popover')}>
      <div className={cx('organizations-search')}>
        {filteredProjects.length > 0 && (
          <ThemeProvider theme="dark">
            <FieldText
              startIcon={<SearchIcon />}
              placeholder={formatMessage(COMMON_LOCALE_KEYS.SEARCH)}
              className={cx('field-text')}
              defaultWidth={false}
              value={valueSearch}
              onChange={handleChange}
              onClear={handleClear}
              maxLength={256}
              clearable
            />
          </ThemeProvider>
        )}
      </div>
      {availableProjects.length > 0 && (
        <>
          <div className={cx('all-organizations')}>
            <NavLink
              to={{ type: ORGANIZATIONS_PAGE }}
              className={cx('all-organizations-link')}
              onClick={() => {
                onClose();
                trackEvent(SIDEBAR_EVENTS.CLICK_ALL_ORGANIZATION_PROJECTS);
              }}
              activeClassName={cx({ active: isAllOrganizationPage })}
            >
              {formatMessage(messages.allOrganizations)}
            </NavLink>
          </div>
          <div className={cx('divider')} />
        </>
      )}
      {filteredProjects.length > 0 && (
        <div className={cx('organizations-assignments')}>
          {formatMessage(messages.assignmentsList)}
        </div>
      )}
      <ScrollWrapper
        autoHide
        autoHeight
        autoHeightMax={maxHeightPopover}
        hideTracksWhenNotNeeded
        className={cx('scroll-wrapper')}
      >
        {filteredProjects.length > 0 ? (
          filteredProjects.map(({ organizationName, organizationSlug, projects }) => (
            <OrganizationsItem
              organizationName={organizationName}
              organizationSlug={organizationSlug}
              projects={projects}
              onClick={() => {
                onClose();
                trackEvent(SIDEBAR_EVENTS.CLICK_PROJECT_NAME);
              }}
              isOpen={currentOrganization === organizationSlug}
              isActive={currentOrganization === organizationSlug && !projectSlug}
              currentProject={projectSlug}
              key={`${organizationSlug}-${projectSlug}`}
              isAllOpen={currentOrganization === organizationSlug || !!valueSearch}
            />
          ))
        ) : (
          <div className={cx('organizations-empty-state')}>
            {formatMessage(messages.noAssignments)}
          </div>
        )}
      </ScrollWrapper>
    </div>
  );
};

OrganizationsPopover.propTypes = {
  closeSidebar: PropTypes.func.isRequired,
  closePopover: PropTypes.func.isRequired,
};
