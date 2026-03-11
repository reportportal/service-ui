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
import { func, bool } from 'prop-types';
import classNames from 'classnames/bind';
import { formatDuration } from 'common/utils';
import { PTTests, PTColumns } from '../../pTypes';
import { TestsTableRow } from '../testsTableRow';
import { matrixFactory } from '../matrixFactory';
import styles from './testsTableBody.scss';

const cx = classNames.bind(styles);

export class TestsTableBody extends React.Component {
  static propTypes = {
    tests: PTTests,
    columns: PTColumns.isRequired,
    getMatrixTooltip: func,
    onItemClick: func,
    opensLinkInNewTab: bool,
  };

  static defaultProps = {
    tests: [],
    getMatrixTooltip: null,
    onItemClick: null,
    opensLinkInNewTab: false,
  };

  constructor(props) {
    super(props);

    this.matrixComponent = props.columns.count && matrixFactory(props.columns.count.renderAsBool);
  }

  renderRow = (test) => {
    const { columns, getMatrixTooltip, onItemClick, opensLinkInNewTab } = this.props;
    const { name, date, count, status, duration } = columns;

    const rowProps = {
      key: `row-${test.uniqueId}-${test.id}`,
      data: test,
      name: test[name.nameKey],
      time: test[date.dateKey],
      count: count && test[count.countKey],
      matrixData: count && test[count.matrixKey],
      matrixComponent: this.matrixComponent,
      status: status && test[status.statusKey],
      duration: duration && formatDuration(test[duration.durationKey]),
      getMatrixTooltip,
      onItemClick,
      opensLinkInNewTab,
    };

    return <TestsTableRow {...rowProps} />;
  };

  render() {
    return <div className={cx('tests-table-body')}>{this.props.tests.map(this.renderRow)}</div>;
  }
}
