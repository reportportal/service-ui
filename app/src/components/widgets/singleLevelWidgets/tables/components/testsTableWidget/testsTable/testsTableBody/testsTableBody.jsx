import * as React from 'react';
import { number, string, oneOfType } from 'prop-types';
import classNames from 'classnames/bind';
import { PTTests, PTColumns } from '../../pTypes';
import { TestsTableRow } from '../testsTableRow';
import { matrixFactory } from '../matrixFactory';
import styles from './testsTableBody.scss';

const cx = classNames.bind(styles);

export class TestsTableBody extends React.Component {
  static propTypes = {
    tests: PTTests,
    columns: PTColumns.isRequired,
    launchId: oneOfType([number, string]).isRequired,
  };

  static defaultProps = {
    tests: [],
  };

  constructor(props) {
    super(props);

    this.matrixComponent = props.columns.count && matrixFactory(props.columns.count.renderAsBool);
  }

  renderRow = (test) => {
    const { columns, launchId } = this.props;
    const { name, date, count, status, duration } = columns;

    const rowProps = {
      key: `row-${test.uniqueId}-${test.id}`,
      launchId,
      data: test,
      name: test[name.nameKey],
      time: test[date.dateKey],
      count: count && test[count.countKey],
      matrixData: count && test[count.matrixKey],
      matrixComponent: this.matrixComponent,
      status: status && test[status.statusKey],
      duration: duration && test[duration.durationKey],
    };

    return <TestsTableRow {...rowProps} />;
  };

  render() {
    return <div className={cx('tests-table-body')}>{this.props.tests.map(this.renderRow)}</div>;
  }
}
