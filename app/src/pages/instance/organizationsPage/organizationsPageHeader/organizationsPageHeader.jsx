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
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { BaseIconButton } from '@reportportal/ui-kit';
import { useIntl } from 'react-intl';
import { SearchField } from 'components/fields/searchField';
import { SEARCH_KEY } from 'controllers/organization/projects/constants';
import { withFilter } from 'controllers/filter';
import { NAMESPACE } from 'controllers/instance/organizations/constants';
import {
  fetchFilteredOrganizationsAction,
  organizationsListLoadingSelector,
} from 'controllers/instance/organizations';
import { ORGANIZATION_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/organizationsPageEvents';
import { withFilterEntitiesURL } from 'components/filterEntities/containers';
import { Filter } from 'components/main/filter';
import PanelViewIcon from '../img/panel-view-inline.svg';
import TableViewIcon from '../img/table-view-inline.svg';
import { messages } from '../messages';
import styles from './organizationsPageHeader.scss';

const cx = classNames.bind(styles);

const SearchFieldWithFilter = withFilter({ filterKey: SEARCH_KEY, namespace: NAMESPACE })(
  SearchField,
);

const FiltersFields = withFilterEntitiesURL(NAMESPACE)(Filter);

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
  const dispatch = useDispatch();
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
              <FiltersFields
                debounced={false}
                appliedFiltersCount={appliedFiltersCount}
                setAppliedFiltersCount={setAppliedFiltersCount}
                filteredAction={() => dispatch(fetchFilteredOrganizationsAction())}
                teammatesFilterMessage={formatMessage(messages.users)}
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
