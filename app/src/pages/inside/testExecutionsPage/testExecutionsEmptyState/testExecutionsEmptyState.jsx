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
import { useIntl, defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import testExecutionsEmptyIcon from './img/test-executions-empty-inline.svg';
import styles from './testExecutionsEmptyState.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  noResults: {
    id: 'TestExecutionsPage.noResults',
    defaultMessage: 'No results',
  },
  noResultsDescription: {
    id: 'TestExecutionsPage.noResultsDescription',
    defaultMessage: 'There are no test execution results matching the selected filters.',
  },
});

export const TestExecutionsEmptyState = () => {
  const { formatMessage } = useIntl();

  return (
    <div className={cx('container')}>
      <div className={cx('icon')}>{Parser(testExecutionsEmptyIcon)}</div>
      <div className={cx('content')}>
        <div className={cx('title')}>{formatMessage(messages.noResults)}</div>
        <div className={cx('description')}>{formatMessage(messages.noResultsDescription)}</div>
      </div>
    </div>
  );
};
