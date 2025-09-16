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
import classNames from 'classnames/bind';
import { TestExecutionsHeader } from './testExecutionsHeader';
import { TestExecutionsEmptyState } from './testExecutionsEmptyState';
import { TestExecutionsTable } from './testExecutionsTable';
import styles from './testExecutionsPage.scss';

const cx = classNames.bind(styles);

export const TestExecutionsPage = () => {
  // TODO: Replace with actual data from selectors and withPagination HOC
  const itemCount = 0;
  const isLoading = false;

  return (
    <div className={cx('test-executions-page')}>
      <TestExecutionsHeader itemCount={itemCount} />
      {itemCount === 0 && !isLoading ? <TestExecutionsEmptyState /> : <TestExecutionsTable />}
    </div>
  );
};
