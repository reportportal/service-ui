/*
 * Copyright 2019 EPAM Systems
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

import * as React from 'react';
import classNames from 'classnames/bind';
import { number, func, string, oneOfType } from 'prop-types';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { TestsTableHeader } from './testsTableHeader';
import { TestsTableBody } from './testsTableBody';
import { PTTests, PTColumns } from '../pTypes';
import styles from './testsTable.scss';

const cx = classNames.bind(styles);

export const TestsTable = ({ tests, columns, launchId, getMaxtrixTooltip }) => (
  <div className={cx('tests-table')}>
    <ScrollWrapper>
      <TestsTableHeader columns={columns} />
      <TestsTableBody
        columns={columns}
        tests={tests}
        launchId={launchId}
        getMaxtrixTooltip={getMaxtrixTooltip}
      />
    </ScrollWrapper>
  </div>
);

TestsTable.propTypes = {
  tests: PTTests.isRequired,
  columns: PTColumns.isRequired,
  launchId: oneOfType([number, string]).isRequired,
  getMaxtrixTooltip: func,
};

TestsTable.defaultProps = {
  getMaxtrixTooltip: null,
};
