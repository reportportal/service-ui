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

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { useIntl } from 'react-intl';

import { Button, PlusIcon, CloseIcon } from '@reportportal/ui-kit';

import { messages } from './messages';

import styles from './filterBlock.scss';

const cx = classNames.bind(styles);

export const FilterBlock = ({ filters, clearAllFilters }) => {
  const { formatMessage } = useIntl();

  return (
    <div className={cx('filter-block')}>
      {filters.status && (
        <div className={cx('filter-block__status')}>
          {filters.status}
          <div className={cx('filter-block__status-icon')} onClick={clearAllFilters}>
            <CloseIcon />
          </div>
        </div>
      )}
      <Button className={cx('filter-block__add-button')} icon={<PlusIcon />} variant="text">
        {formatMessage(messages.addNew)}
      </Button>
      <Button
        className={cx('filter-block__clear-button')}
        icon={<CloseIcon />}
        variant="text"
        onClick={clearAllFilters}
      >
        {formatMessage(messages.clearAll)}
      </Button>
    </div>
  );
};

FilterBlock.propTypes = {
  filters: PropTypes.shape({
    status: PropTypes.string,
  }).isRequired,
  clearAllFilters: PropTypes.func.isRequired,
};
