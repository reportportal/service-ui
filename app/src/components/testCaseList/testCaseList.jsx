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
import classNames from 'classnames/bind';
import { useIntl } from 'react-intl';
import { FilterOutlineIcon } from '@reportportal/ui-kit';
import { SearchField } from 'components/fields/searchField';
import { withFilter } from 'controllers/filter';
import { TestCaseCard } from './testCaseCard/testCaseCard';
import { mockTestCases } from './mockData';
import { NAMESPACE, SEARCH_KEY, DEFAULT_CURRENT_PAGE } from './testCaseList.constants';
import { messages } from './messages';
import styles from './testCaseList.scss';

const cx = classNames.bind(styles);

const SearchFieldWithFilter = withFilter({
  filterKey: SEARCH_KEY,
  namespace: NAMESPACE,
})(SearchField);

export const TestCaseList = ({
  testCases = mockTestCases,
  loading = false,
  currentPage = DEFAULT_CURRENT_PAGE,
  itemsPerPage,
  searchValue = '',
  onSearchChange,
  onEdit,
  onDelete,
  onDuplicate,
  onMove,
}) => {
  const { formatMessage } = useIntl();

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = testCases.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className={cx('test-case-list', 'loading')}>
        <div className={cx('loading-message')}>{formatMessage(messages.loadingMessage)}</div>
      </div>
    );
  }

  return (
    <div className={cx('test-case-list')}>
      {/* Controls with title and search */}
      <div className={cx('controls')}>
        <div className={cx('controls-title')}>{formatMessage(messages.allTestCasesTitle)}</div>
        <div className={cx('controls-actions')}>
          <div className={cx('search-section')}>
            <SearchFieldWithFilter
              isLoading={loading}
              searchValue={searchValue}
              setSearchValue={onSearchChange}
              placeholder={formatMessage(messages.searchPlaceholder)}
              isTransparent
            />
            <div className={cx('filter-icon')}>
              <FilterOutlineIcon />
            </div>
          </div>
        </div>
      </div>

      <div className={cx('column-headers')}>
        <div className={cx('name-header')}>{formatMessage(messages.nameHeader)}</div>
        <div className={cx('execution-header')}>{formatMessage(messages.executionHeader)}</div>
      </div>

      <div className={cx('cards-container')}>
        {currentData.length > 0 ? (
          currentData.map((testCase) => (
            <TestCaseCard
              key={testCase.id}
              testCase={testCase}
              onEdit={onEdit}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              onMove={onMove}
            />
          ))
        ) : (
          <div className={cx('no-results')}>
            <div className={cx('no-results-message')}>
              {searchValue
                ? formatMessage(messages.noResultsFilteredMessage)
                : formatMessage(messages.noResultsEmptyMessage)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

TestCaseList.propTypes = {
  testCases: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      tags: PropTypes.arrayOf(PropTypes.string),
      lastExecution: PropTypes.string.isRequired,
    }),
  ),
  loading: PropTypes.bool,
  currentPage: PropTypes.number,
  itemsPerPage: PropTypes.number.isRequired,
  searchValue: PropTypes.string,
  onSearchChange: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onDuplicate: PropTypes.func,
  onMove: PropTypes.func,
};

TestCaseList.defaultProps = {
  testCases: mockTestCases,
  loading: false,
  currentPage: DEFAULT_CURRENT_PAGE,
  searchValue: '',
  onSearchChange: () => {},
  onEdit: () => {},
  onDelete: () => {},
  onDuplicate: () => {},
  onMove: () => {},
};
