import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import { activeProjectSelector } from 'controllers/user';
import { TEST_ITEM_PAGE } from 'controllers/pages';
import { getQueryNamespace } from 'controllers/testItem';
import { createNamespacedQuery } from 'common/utils/routingUtils';
import { ALL } from 'common/constants/reservedFilterIds';

import classNames from 'classnames/bind';
import { PatternNameColumn, LaunchNameColumn, TestCasesColumn } from './patternGridColumns';

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
const LAUNCH_NAME_COLUMN = 'launch';
const TEST_CASES_COLUMN = 'testCases';

@connect((state) => ({
  projectId: activeProjectSelector(state),
}))
@injectIntl
export class PatternGrid extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    widget: PropTypes.object,
    selectedPattern: PropTypes.string,
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
    selectedPattern: null,
    selectedAttribute: null,
    projectId: '',
    onPatternClick: () => {},
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
        columnProps: {
          getLinkToLaunch: this.getLinkToLaunch,
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

  getLinkToLaunch = (launchId) => {
    const {
      projectId,
      widget: { appliedFilters },
      selectedPattern,
    } = this.props;
    const filterId = appliedFilters && appliedFilters.length ? appliedFilters[0].id : ALL;
    return {
      type: TEST_ITEM_PAGE,
      payload: {
        projectId,
        filterId,
        testItemIds: launchId,
      },
      meta: {
        query: createNamespacedQuery(
          {
            'filter.eq.hasChildren': false,
            'filter.any.patternName': selectedPattern,
          },
          getQueryNamespace(0),
        ),
      },
    };
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
