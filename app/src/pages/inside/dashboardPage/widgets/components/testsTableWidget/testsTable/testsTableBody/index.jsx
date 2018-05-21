import * as React from 'react';
import { func } from 'prop-types';
import classNames from 'classnames/bind';
import { PTTests, PTColumns } from '../../pTypes';
import { TestsTableRow } from '../testsTableRow';
import { matrixFactory } from '../matrix';
import styles from './testsTableBody.scss';

const cx = classNames.bind(styles);

class TestsTableBody extends React.Component {
  static propTypes = {
    tests: PTTests,
    nameClickHandler: func.isRequired,
    columns: PTColumns.isRequired,
  };

  static defaultProps = {
    tests: [],
  };

  constructor(props) {
    super(props);

    this.matrixComponent = matrixFactory(this.props.columns.count.renderAsBool);
  }

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
        matrixComponent={this.matrixComponent}
      />
    );
  };

  render() {
    return <div className={cx('tests-table-body')}>{this.props.tests.map(this.renderRow)}</div>;
  }
}

export { TestsTableBody };
