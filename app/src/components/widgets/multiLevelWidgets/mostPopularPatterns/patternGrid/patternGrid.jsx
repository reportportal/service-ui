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

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, defineMessages } from 'react-intl';
import { activeProjectSelector } from 'controllers/user';
import classNames from 'classnames/bind';
import { PatternNameColumn, TestCasesColumn } from './patternGridColumns';
import styles from './patternGrid.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  patternName: {
    id: 'MostPopularPatterns.patternName',
    defaultMessage: 'Pattern name',
  },
  launchName: {
    id: 'MostPopularPatterns.launchName',
    defaultMessage: 'Launch name',
  },
  testCases: {
    id: 'MostPopularPatterns.testCases',
    defaultMessage: 'Test cases',
  },
});

const PATTERN_NAME_COLUMN = 'pattern';
const TEST_CASES_COLUMN = 'testCases';

@connect((state) => ({
  projectId: activeProjectSelector(state),
}))
@injectIntl
export class PatternGrid extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    widget: PropTypes.object,
    selectedAttribute: PropTypes.string,
    projectId: PropTypes.string,
    onPatternClick: PropTypes.func,
  };

  static defaultProps = {
    widget: {
      appliedFilters: [
        {
          id: 'all',
        },
      ],
      content: {
        result: [],
      },
      contentParameters: {
        widgetOptions: {
          attributeKey: '',
        },
      },
    },
    selectedAttribute: null,
    projectId: '',
    onPatternClick: () => {},
  };

  getColumns = () => {
    const { onPatternClick } = this.props;
    return [
      {
        id: PATTERN_NAME_COLUMN,
        component: PatternNameColumn,
        title: this.props.intl.formatMessage(messages.patternName),
        className: 'pattern-col',
        columnProps: {
          onPatternClick,
        },
      },
      {
        id: TEST_CASES_COLUMN,
        title: this.props.intl.formatMessage(messages.testCases),
        component: TestCasesColumn,
        className: 'test-cases-col',
      },
    ];
  };

  getDataByAttribute = (data = [], attribute) =>
    (data.find((group) => group.attributeValue === attribute) || {}).patterns;

  renderHeader = (columns) => (
    <thead>
      <tr className={cx('patterns-header')}>
        {columns.map((column, ind) => (
          <th className={cx('cell', column.className)} key={column.title || ind}>
            {column.title}
          </th>
        ))}
      </tr>
    </thead>
  );

  renderBody = (columns, data = []) => (
    <tbody>
      {data.map((row, rowIndex) => (
        <tr className={cx('patterns-row')} key={`row-${row.id || row.name || rowIndex}`}>
          {columns.map((column) => {
            const CellComponent = column.component;
            return (
              <td
                className={cx('cell', column.className)}
                key={`col-${row.id || row.name}-${column.title}`}
              >
                <CellComponent value={row} {...column.columnProps} />
              </td>
            );
          })}
        </tr>
      ))}
    </tbody>
  );

  render() {
    const {
      widget: {
        content: { result },
      },
      selectedAttribute,
    } = this.props;
    const columns = this.getColumns();
    const data = this.getDataByAttribute(result, selectedAttribute);

    return (
      <Fragment>
        <table className={cx('patterns-table')}>
          {this.renderHeader(columns)}
          {this.renderBody(columns, data)}
        </table>
      </Fragment>
    );
  }
}
