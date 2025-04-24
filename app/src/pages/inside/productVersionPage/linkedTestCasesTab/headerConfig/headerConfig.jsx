/*
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

import React, { Fragment, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { useIntl } from 'react-intl';
import { FilterFilledIcon, FilterOutlineIcon, Popover, Toggle } from '@reportportal/ui-kit';

import { SearchField } from 'components/fields/searchField';

import { messages } from './messages';

import styles from './headerConfig.scss';

const cx = classNames.bind(styles);

export const HeaderConfig = ({ filters, setFilters }) => {
  const { formatMessage } = useIntl();
  const [isShowFolders, setIsShowFolders] = useState(false);
  const [appliedFiltersCount, setAppliedFiltersCount] = useState(0);
  const [isMainFilterOpen, setIsMainFilterOpen] = useState(false);
  const [isInnerFilterOpen, setIsInnerFilterOpen] = useState(false);

  useEffect(() => {
    setAppliedFiltersCount(Object.keys(filters).length);
  }, [filters]);

  const handleFilters = () => {
    setFilters((prevState) => ({ ...prevState, status: 'Executed' }));
    setIsMainFilterOpen(false);
    setIsInnerFilterOpen(false);
  };

  return (
    <div className={cx('header-config')}>
      <div className={cx('header-config__filters')}>
        <SearchField
          searchValue=""
          setSearchValue={() => {}}
          placeholder={formatMessage(messages.searchPlaceholder)}
          className={cx('header-config__filters--search-input')}
        />
        <Popover
          content={
            <>
              <Popover
                content={
                  <>
                    <div className={cx('filter-popover__item')} onClick={handleFilters}>
                      {formatMessage(messages.executed)}
                    </div>
                    <div className={cx('filter-popover__item')}>
                      {formatMessage(messages.notExecuted)}
                    </div>
                  </>
                }
                placement="left-start"
                className={cx('filter-popover', 'filter-popover--inner')}
                isOpened={isInnerFilterOpen}
                setIsOpened={setIsInnerFilterOpen}
              >
                <div
                  className={cx('filter-popover__item', 'filter-popover__item--popover', {
                    'filter-popover__item--popover-open': isInnerFilterOpen,
                  })}
                  tabIndex={0}
                >
                  <span>{formatMessage(messages.executionStatus)}</span>
                </div>
              </Popover>
              <div className={cx('filter-popover__item')}>{formatMessage(messages.tag)}</div>
              <div className={cx('filter-popover__item')}>
                {formatMessage(messages.defaultVersion)}
              </div>
            </>
          }
          placement="bottom-end"
          className={cx('filter-popover')}
          isOpened={isMainFilterOpen}
          setIsOpened={setIsMainFilterOpen}
        >
          <div
            className={cx('filters-icon-container', {
              'with-applied': appliedFiltersCount,
              opened: isMainFilterOpen,
            })}
            tabIndex={0}
          >
            <div className={cx('header-config__filters--filter-icon-wrapper')}>
              <i className={cx('filter-icon')}>
                {appliedFiltersCount ? <FilterFilledIcon /> : <FilterOutlineIcon />}
              </i>
            </div>
            {appliedFiltersCount ? (
              <span className={cx('filters-count')}>{appliedFiltersCount}</span>
            ) : null}
          </div>
        </Popover>
      </div>
      <div className={cx('header-config__toggle')}>
        <Toggle value={isShowFolders} onChange={(e) => setIsShowFolders(e.target.checked)}>
          <span className={cx('name-wrapper')}>{formatMessage(messages.showFolders)}</span>
        </Toggle>
      </div>
    </div>
  );
};

HeaderConfig.propTypes = {
  filters: PropTypes.shape({
    status: PropTypes.string,
  }),
  setFilters: PropTypes.func,
};
