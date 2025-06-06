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

import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { useIntl } from 'react-intl';
import { InputDropdownSorting } from 'components/inputs/inputDropdownSorting';
import {
  PAGE_INCREMENT,
  DECIMAL_RADIX,
  PERCENTAGE_MULTIPLIER,
  FIRST_PAGE,
} from './pagination.constants';
import { messages } from './messages';
import styles from './pagination.scss';

const cx = classNames.bind(styles);

export const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  itemsPerPageOptions,
  onPageChange,
  onItemsPerPageChange,
}) => {
  const { formatMessage } = useIntl();
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePrevious = () => {
    if (currentPage > FIRST_PAGE) {
      onPageChange(currentPage - PAGE_INCREMENT);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + PAGE_INCREMENT);
    }
  };

  const handlePageClick = (page) => {
    onPageChange(page);
  };

  const handleItemsPerPageChange = useCallback(
    (value) => {
      onItemsPerPageChange(parseInt(value, DECIMAL_RADIX));
    },
    [onItemsPerPageChange],
  );

  const itemsPerPageDropdownOptions = useMemo(
    () =>
      itemsPerPageOptions.map((option) => ({
        value: option.toString(),
        label: option.toString(),
      })),
    [itemsPerPageOptions],
  );

  const progressPercentage =
    totalPages > 0 ? (currentPage / totalPages) * PERCENTAGE_MULTIPLIER : 0;

  return (
    <div className={cx('pagination')}>
      {/* Left part: Items count */}
      <div className={cx('items-count')}>
        <span className={cx('count-text')}>
          {startItem}-{endItem} {formatMessage(messages.of)} {totalItems}{' '}
          {formatMessage(messages.items)}
        </span>
      </div>

      {/* Center part: Page navigation */}
      <div className={cx('page-navigation')}>
        {/* Current page display */}
        <div className={cx('page-info')}>
          {formatMessage(messages.page)}{' '}
          <span className={cx('current-page-number')}>{currentPage}</span>
        </div>

        {/* Navigation controls */}
        <div className={cx('nav-controls')}>
          <button
            className={cx('nav-button', 'first-page')}
            onClick={() => handlePageClick(FIRST_PAGE)}
            disabled={currentPage === FIRST_PAGE}
          >
            <span className={cx('vertical-line', { disabled: currentPage === FIRST_PAGE })} />◀
          </button>

          <button
            className={cx('nav-button', 'prev-page')}
            onClick={handlePrevious}
            disabled={currentPage === FIRST_PAGE}
          >
            ◀
          </button>

          {/* Status bar */}
          <div className={cx('status-bar')}>
            <div className={cx('status-fill')} style={{ width: `${progressPercentage}%` }} />
          </div>

          <button
            className={cx('nav-button', 'next-page')}
            onClick={handleNext}
            disabled={currentPage === totalPages}
          >
            ▶
          </button>

          <button
            className={cx('nav-button', 'last-page')}
            onClick={() => handlePageClick(totalPages)}
            disabled={currentPage === totalPages}
          >
            ▶<span className={cx('vertical-line', { disabled: currentPage === totalPages })} />
          </button>
        </div>

        {/* Total pages display */}
        <div className={cx('total-pages')}>
          {formatMessage(messages.of)} {totalPages}
        </div>
      </div>

      {/* Right part: Items per page */}
      <div className={cx('items-per-page')}>
        <InputDropdownSorting
          value={itemsPerPage.toString()}
          options={itemsPerPageDropdownOptions}
          onChange={handleItemsPerPageChange}
          positionTop
          transparent
          hideArrow
          boldValue
        />
        <span className={cx('per-page-label')}>{formatMessage(messages.perPage)}</span>
      </div>
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  totalItems: PropTypes.number.isRequired,
  itemsPerPage: PropTypes.number.isRequired,
  itemsPerPageOptions: PropTypes.arrayOf(PropTypes.number).isRequired,
  onPageChange: PropTypes.func.isRequired,
  onItemsPerPageChange: PropTypes.func.isRequired,
};
