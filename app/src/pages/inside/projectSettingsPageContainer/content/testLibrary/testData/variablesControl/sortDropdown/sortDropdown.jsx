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
import { defineMessages, useIntl } from 'react-intl';
import classNames from 'classnames/bind';

import { Button, ChevronDownDropdownIcon, SortIcon } from '@reportportal/ui-kit';

import { PopoverControl } from 'pages/common/popoverControl';

import styles from './sortDropdown.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  olderFirst: {
    id: 'VariableSortDropdown.olderFirst',
    defaultMessage: 'Older first',
  },
  newestFirst: {
    id: 'VariableSortDropdown.newestFirst',
    defaultMessage: 'Newest first',
  },
  az: {
    id: 'VariableSortDropdown.az',
    defaultMessage: 'A-Z',
  },
  za: {
    id: 'VariableSortDropdown.za',
    defaultMessage: 'Z-A',
  },
});

export const SortDropdown = () => {
  const { formatMessage } = useIntl();

  return (
    <PopoverControl
      items={[
        { label: formatMessage(messages.olderFirst) },
        { label: formatMessage(messages.newestFirst) },
        { label: formatMessage(messages.az) },
        { label: formatMessage(messages.za) },
      ]}
    >
      <Button variant="text" className={cx('sort-dropdown__control')}>
        <SortIcon />
        {formatMessage(messages.olderFirst)}
        <span className={cx('sort-dropdown__chevron')}>
          <ChevronDownDropdownIcon />
        </span>
      </Button>
    </PopoverControl>
  );
};
