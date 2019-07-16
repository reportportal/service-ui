import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, defineMessages } from 'react-intl';

import classNames from 'classnames/bind';
import {
  PatternNameColumn,
  LaunchNameColumn,
  TestCasesColumn,
  TestCasesLinkColumn,
} from './patternGridColumns';

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
  loadMore: {
    id: 'MostPopularPatterns.loadMore',
    defaultMessage: 'Load more',
  },
});

const PATTERN_NAME_COLUMN = 'pattern';
const LAUNCH_NAME_COLUMN = 'launch';
const TEST_CASES_COLUMN = 'testCases';
const TEST_CASES_LINK_COLUMN = 'testCasesLink';

@injectIntl
export class PatternGrid extends PureComponent {
  static propTypes = {
    intl: intlShape.isRequired,
    data: PropTypes.arrayOf(PropTypes.object),
    selectedPattern: PropTypes.string,
    onPatternClick: PropTypes.func,
    getLinkToLaunch: PropTypes.func,
  };

  static defaultProps = {
    data: [],
    selectedPattern: null,
    onPatternClick: () => {},
    getLinkToLaunch: () => {},
  };

  getColumns = () => {
    const { selectedPattern, onPatternClick } = this.props;
    if (!selectedPattern) {
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
    }
    return [
      {
        id: LAUNCH_NAME_COLUMN,
        component: LaunchNameColumn,
        title: this.props.intl.formatMessage(messages.launchName),
        className: 'launch-col',
      },
      {
        id: TEST_CASES_LINK_COLUMN,
        title: this.props.intl.formatMessage(messages.testCases),
        component: TestCasesLinkColumn,
        className: 'test-cases-col',
        columnProps: {
          getLinkToLaunch: this.props.getLinkToLaunch,
        },
      },
    ];
  };

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

  renderBody = (columns, data) => (
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
    const { data } = this.props;
    const columns = this.getColumns();

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
