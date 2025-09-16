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
import { useIntl, defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import { Button, ExportIcon, RefreshIcon, Tooltip } from '@reportportal/ui-kit';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import {
  LaunchStartTimeFilter,
  LaunchNamesFilter,
  LaunchAttributesFilter,
} from '../testExecutionsFilters';
import styles from './testExecutionsHeader.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  title: {
    id: 'TestExecutionsPage.title',
    defaultMessage: 'Test Executions',
  },
  exportTooltip: {
    id: 'TestExecutionsPage.exportTooltip',
    defaultMessage: 'No items to export',
  },
});

export const TestExecutionsHeader = ({ itemCount }) => {
  const { formatMessage } = useIntl();

  const exportButton = (
    <Button variant="text" adjustWidthOn="content" icon={<ExportIcon />} disabled={itemCount === 0}>
      {formatMessage(COMMON_LOCALE_KEYS.EXPORT)}
    </Button>
  );

  return (
    <div className={cx('test-executions-header-container')}>
      <div className={cx('header')}>
        <span className={cx('title')}>{formatMessage(messages.title)}</span>
        <div className={cx('actions')}>
          {itemCount === 0 ? (
            <Tooltip content={formatMessage(messages.exportTooltip)}>{exportButton}</Tooltip>
          ) : (
            exportButton
          )}
          <Button variant="ghost" icon={<RefreshIcon />}>
            {formatMessage(COMMON_LOCALE_KEYS.REFRESH)}
          </Button>
        </div>
      </div>
      <div className={cx('filters')}>
        <LaunchStartTimeFilter />
        <LaunchNamesFilter />
        <LaunchAttributesFilter />
      </div>
    </div>
  );
};

TestExecutionsHeader.propTypes = {
  itemCount: PropTypes.number,
};
