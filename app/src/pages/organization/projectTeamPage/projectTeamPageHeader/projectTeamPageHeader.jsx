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

import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { Button, FilterOutlineIcon } from '@reportportal/ui-kit';
import { useIntl } from 'react-intl';
import { projectMembersSelector, projectNameSelector } from 'controllers/project';
import { SearchField } from 'components/fields/searchField';
import { NAMESPACE, SEARCH_KEY } from 'controllers/members/constants';
import { withFilter } from 'controllers/filter';
import { PROJECT_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/projectPageEvents';
import { activeOrganizationNameSelector } from 'controllers/organization';
import { LocationHeaderLayout } from 'layouts/locationHeaderLayout';
import { messages } from '../../messages';
import styles from './projectTeamPageHeader.scss';

const cx = classNames.bind(styles);

const SearchFieldWithFilter = withFilter({ filterKey: SEARCH_KEY, namespace: NAMESPACE })(
  SearchField,
);

export const ProjectTeamPageHeader = ({
  hasPermission,
  onInvite,
  isMembersLoading,
  searchValue,
  setSearchValue,
}) => {
  const { formatMessage } = useIntl();
  const projectName = useSelector(projectNameSelector);
  const organizationName = useSelector(activeOrganizationNameSelector);
  const isNotEmptyMembers = useSelector(projectMembersSelector).length > 0;

  return (
    <LocationHeaderLayout
      title={formatMessage(messages.projectTeamTitle)}
      organizationName={organizationName}
      projectName={projectName}
    >
      <div className={cx('actions')}>
        {isNotEmptyMembers && (
          <>
            <div className={cx('icons')}>
              <div className={cx('filters')}>
                <SearchFieldWithFilter
                  isLoading={isMembersLoading}
                  searchValue={searchValue}
                  setSearchValue={setSearchValue}
                  placeholder={formatMessage(messages.searchPlaceholder)}
                  event={PROJECT_PAGE_EVENTS.SEARCH_PROJECT_TEAM_FIELD}
                />
                <i className={cx('filters-icon')}>
                  <FilterOutlineIcon />
                </i>
              </div>
            </div>
            {hasPermission && (
              <Button variant={'ghost'} onClick={onInvite}>
                {formatMessage(messages.inviteUser)}
              </Button>
            )}
          </>
        )}
      </div>
    </LocationHeaderLayout>
  );
};

ProjectTeamPageHeader.propTypes = {
  isMembersLoading: PropTypes.bool.isRequired,
  searchValue: PropTypes.string.isRequired,
  setSearchValue: PropTypes.func.isRequired,
  hasPermission: PropTypes.bool,
  onInvite: PropTypes.func,
};

ProjectTeamPageHeader.defaultProps = {
  hasPermission: false,
  onInvite: () => {},
};
