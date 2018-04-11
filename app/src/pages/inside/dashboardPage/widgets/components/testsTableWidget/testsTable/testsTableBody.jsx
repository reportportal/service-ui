import * as React from 'react';
import { func } from 'prop-types';
import classNames from 'classnames/bind';
import { PTTests, PTColumns } from '../pTypes';
import TestsTableRow from './testsTableRow';
import styles from '../testsTableWidget.scss';

const cx = classNames.bind(styles);

class TestsTableBody extends React.PureComponent {
  static propTypes = {
    tests: PTTests.isRequired,
    nameClickHandler: func.isRequired,
    columns: PTColumns.isRequired,
  };

  renderRow = (test) => {
    const { columns, nameClickHandler } = this.props;
    const { count } = columns;

    return (
      <TestsTableRow
        key={`row-${test.uniqueId}`}
        data={test}
        nameClickHandler={nameClickHandler}
        countKey={count.countKey}
        matrixDataKey={count.matrixKey}
      />
    );
  };

  render() {
    const { tests = [] } = this.props;

    return <div className={cx('tests-table-body')}>{tests.map(this.renderRow)}</div>;
  }
}

export default TestsTableBody;
