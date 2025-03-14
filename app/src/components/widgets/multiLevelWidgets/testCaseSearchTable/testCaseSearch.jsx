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

import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { searchedTestItemsSelector, testItemsSearchAction } from 'controllers/testItem';
import { TestCaseSearchControl } from 'components/widgets/multiLevelWidgets/testCaseSearchTable/testCaseSearchControl';
import { TestCaseSearchContent } from 'components/widgets/multiLevelWidgets/testCaseSearchTable/testCaseSearchContent';
import { SORTING_ASC, SORTING_DESC } from 'controllers/sorting';
import styles from './testCaseSearch.scss';

const cx = classNames.bind(styles);
export const TestCaseSearch = ({ widget: { id: widgetId }, isDisplayedLaunches }) => {
  const searchDetails = useSelector(searchedTestItemsSelector);
  const targetWidgetSearch = searchDetails[widgetId] || {};
  const { searchCriteria = {}, content = [], loading = false } = targetWidgetSearch;
  const [searchValue, setSearchValue] = useState(searchCriteria);
  const [sortingDirection, setSortingDirection] = useState(SORTING_DESC);
  const dispatch = useDispatch();

  const isSearchValueEmpty = !Object.keys(searchValue).length;
  const handleSearch = (entity) => {
    setSearchValue(entity);
  };
  const handleClear = () => {
    setSearchValue({});
  };
  const handleChangeSorting = () => {
    setSortingDirection(sortingDirection === SORTING_DESC ? SORTING_ASC : SORTING_DESC);
  };

  useEffect(() => {
    if (isSearchValueEmpty) return;
    dispatch(
      testItemsSearchAction({
        searchParams: { searchCriteria: searchValue, sortingDirection },
        widgetId,
      }),
    );
  }, [searchValue, sortingDirection]);

  return (
    <div className={cx('test-case-search-container')}>
      <TestCaseSearchControl
        filter={searchValue}
        setFilter={setSearchValue}
        onChange={handleSearch}
        onClear={handleClear}
      />
      <TestCaseSearchContent
        listView={isDisplayedLaunches}
        isEmptyState={isSearchValueEmpty}
        data={content}
        loading={loading}
        sortingDirection={sortingDirection}
        onChangeSorting={handleChangeSorting}
      />
    </div>
  );
};

TestCaseSearch.propTypes = {
  widget: PropTypes.object,
  isDisplayedLaunches: PropTypes.bool,
};
