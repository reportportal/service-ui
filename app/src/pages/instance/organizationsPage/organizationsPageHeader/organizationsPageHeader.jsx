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
import filterIcon from 'common/img/newIcons/filters-outline-inline.svg';
import { useIntl } from 'react-intl';
import { SearchField } from 'components/fields/searchField';
import { useSelector } from 'react-redux';
import { organizationsListLoadingSelector } from 'controllers/instance/organizations';
import { ORGANIZATION_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/organizationsPageEvents';
import { messages } from '../messages';
import styles from './organizationsPageHeader.scss';

const cx = classNames.bind(styles);

export const OrganizationsPageHeader = ({ isEmpty, searchValue, setSearchValue }) => {
  const { formatMessage } = useIntl();
  const projectsLoading = useSelector(organizationsListLoadingSelector);

  return (
    <div className={cx('organizations-page-header-container')}>
      <div className={cx('header')}>
        <span className={cx('title')}>{formatMessage(messages.title)}</span>
        <div className={cx('actions')}>
          {!isEmpty && (
            <div className={cx('icons')}>
              <SearchField
                isLoading={projectsLoading}
                searchValue={searchValue}
                setSearchValue={setSearchValue}
                placeholder={formatMessage(messages.searchPlaceholder)}
                event={ORGANIZATION_PAGE_EVENTS.SEARCH_ORGANIZATION_FIELD}
              />
              <i className={cx('filters-icon')}>{Parser(filterIcon)}</i>
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
};

OrganizationsPageHeader.defaultProps = {
  isEmpty: false,
};
