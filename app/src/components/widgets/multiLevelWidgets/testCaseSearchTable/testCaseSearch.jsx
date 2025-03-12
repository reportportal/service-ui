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
import React, { useState } from 'react';
import { createFilterQuery } from 'components/filterEntities/containers/utils';
import { useDispatch, useSelector } from 'react-redux';
import { searchedTestItemsSelector, testItemsSearchAction } from 'controllers/testItem';
import { TestCaseSearchControl } from 'components/widgets/multiLevelWidgets/testCaseSearchTable/testCaseSearchControl';
import { TestCaseSearchContent } from 'components/widgets/multiLevelWidgets/testCaseSearchTable/testCaseSearchContent';
import { collectFilterEntities } from 'controllers/filter/utils';
import styles from './testCaseSearch.scss';

const cx = classNames.bind(styles);
export const TestCaseSearch = ({ widget: { id: widgetId }, isDisplayedLaunches }) => {
  const searchDetails = useSelector(searchedTestItemsSelector);
  const targetWidgetSearch = searchDetails[widgetId] || {};
  const { searchCriteria = {}, content = [] } = targetWidgetSearch;
  const [searchValue, setSearchValue] = useState(collectFilterEntities(searchCriteria));
  const dispatch = useDispatch();

  const isSearchValueEmpty = !Object.keys(searchValue).length;
  const handleSearch = (entity) => {
    const filter = createFilterQuery(entity);
    setSearchValue(entity);
    dispatch(testItemsSearchAction({ searchCriteria: filter, widgetId }));
  };
  const handleClear = () => {
    setSearchValue({});
    dispatch(testItemsSearchAction({ widgetId }));
  };

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
      />
    </div>
  );
};

TestCaseSearch.propTypes = {
  widget: PropTypes.object,
  isDisplayedLaunches: PropTypes.bool,
};
