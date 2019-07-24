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

    this.matrixComponent = matrixFactory(this.props.columns.count.renderAsBool);
  }

  renderRow = (test) => {
    const { columns, launchId } = this.props;
    const { count, name, date } = columns;

    return (
      <TestsTableRow
        key={`row-${test.uniqueId}`}
        launchId={launchId}
        data={test}
        name={test[name.nameKey]}
        count={test[count.countKey]}
        matrixData={test[count.matrixKey]}
        time={test[date.dateKey]}
        matrixComponent={this.matrixComponent}
      />
    );
  };

  render() {
    return <div className={cx('tests-table-body')}>{this.props.tests.map(this.renderRow)}</div>;
  }
}
