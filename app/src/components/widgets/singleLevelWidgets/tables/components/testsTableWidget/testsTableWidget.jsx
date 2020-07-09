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
import { object, element, bool, func } from 'prop-types';
import classNames from 'classnames/bind';
import { LaunchInfoBlock } from './launchInfoBlock';
import { TestsTable } from './testsTable';
import { PTTests, PTColumns } from './pTypes';
import styles from './testsTableWidget.scss';

const cx = classNames.bind(styles);

export const TestsTableWidget = ({
  launch,
  tests,
  issueType,
  columns,
  getMaxtrixTooltip,
  hideInfoBlock,
}) => {
  const launchName = launch.number ? `${launch.name} #${launch.number}` : launch.name;

  return (
    <div className={cx('tests-table-widget')}>
      <div className={cx('widget-wrapper')}>
        {!hideInfoBlock && <LaunchInfoBlock launchName={launchName} issueType={issueType} />}
        <TestsTable
          columns={columns}
          tests={tests}
          launchId={launch.id}
          getMaxtrixTooltip={getMaxtrixTooltip}
        />
      </div>
    </div>
  );
};

TestsTableWidget.propTypes = {
  launch: object.isRequired,
  tests: PTTests.isRequired,
  issueType: element,
  columns: PTColumns.isRequired,
  getMaxtrixTooltip: func,
  hideInfoBlock: bool,
};

TestsTableWidget.defaultProps = {
  issueType: null,
  hideInfoBlock: false,
  getMaxtrixTooltip: null,
};
