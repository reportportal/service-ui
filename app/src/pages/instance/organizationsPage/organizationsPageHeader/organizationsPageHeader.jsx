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
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { BaseIconButton } from '@reportportal/ui-kit';
import filterIcon from 'common/img/newIcons/filters-outline-inline.svg';
import { useIntl } from 'react-intl';
import { SearchField } from 'components/fields/searchField';
import { SEARCH_KEY } from 'controllers/organization/projects/constants';
import { withFilter } from 'controllers/filter';
import { FILTERED_ORGANIZATIONS, NAMESPACE } from 'controllers/instance/organizations/constants';
import { useSelector } from 'react-redux';
import { organizationsListLoadingSelector } from 'controllers/instance/organizations';
import { ORGANIZATION_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/organizationsPageEvents';
import { withFilterEntitiesURL } from 'components/filterEntities/containers';
import PanelViewIcon from '../img/panel-view-inline.svg';
import TableViewIcon from '../img/table-view-inline.svg';
import { OrganizationsFilter } from './organizationsFilter';
import { messages } from '../messages';
import styles from './organizationsPageHeader.scss';

const cx = classNames.bind(styles);

const SearchFieldWithFilter = withFilter({ filterKey: SEARCH_KEY, namespace: NAMESPACE })(
  SearchField,
);

const FiltersFields = withFilterEntitiesURL(FILTERED_ORGANIZATIONS)(OrganizationsFilter);

export const OrganizationsPageHeader = ({
  isEmpty,
  searchValue,
  setSearchValue,
  openPanelView,
  openTableView,
  isOpenTableView,
  appliedFiltersCount,
  setAppliedFiltersCount,
}) => {
  const { formatMessage } = useIntl();
  const projectsLoading = useSelector(organizationsListLoadingSelector);

  return (
    <div className={cx('organizations-page-header-container')}>
      <div className={cx('header')}>
        <span className={cx('title')}>{formatMessage(messages.title)}</span>
        <div className={cx('actions')}>
          {!isEmpty && (
            <div className={cx('icons')}>
              <SearchFieldWithFilter
                isLoading={projectsLoading}
                searchValue={searchValue}
                setSearchValue={setSearchValue}
                placeholder={formatMessage(messages.searchPlaceholder)}
                event={ORGANIZATION_PAGE_EVENTS.SEARCH_ORGANIZATION_FIELD}
              />
              <i className={cx('filters-icon')}>{Parser(filterIcon)}</i>
              <FiltersFields
                debounced={false}
                appliedFiltersCount={appliedFiltersCount}
                setAppliedFiltersCount={setAppliedFiltersCount}
              />
              <BaseIconButton
                className={cx('panel-icon', { active: !isOpenTableView })}
                onClick={openPanelView}
                variant={'text'}
              >
                {Parser(PanelViewIcon)}
              </BaseIconButton>
              <BaseIconButton
                className={cx('panel-icon', { active: isOpenTableView })}
                onClick={openTableView}
                variant={'text'}
              >
                {Parser(TableViewIcon)}
              </BaseIconButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

OrganizationsPageHeader.propTypes = {
  isEmpty: PropTypes.bool,
  searchValue: PropTypes.string || null,
  setSearchValue: PropTypes.func.isRequired,
  openPanelView: PropTypes.func.isRequired,
  openTableView: PropTypes.func.isRequired,
  isOpenTableView: PropTypes.bool.isRequired,
  appliedFiltersCount: PropTypes.bool.isRequired,
  setAppliedFiltersCount: PropTypes.func.isRequired,
};

OrganizationsPageHeader.defaultProps = {
  isEmpty: false,
};
