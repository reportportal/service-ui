import * as React from 'react';
import { func } from 'prop-types';
import classNames from 'classnames/bind';
import { PTTests } from '../pTypes';
import styles from '../mostFailedTests.scss';
import FailedTestsTableRow from './mostFailedTestsTableRow';

const cx = classNames.bind(styles);

class FailedTestsTableBody extends React.PureComponent {
  static propTypes = {
    tests: PTTests.isRequired,
    nameClickHandler: func.isRequired,
  };

  renderRow = (test) => (
    <FailedTestsTableRow
      key={`row-${test.uniqueId}`}
      data={test}
      nameClickHandler={this.props.nameClickHandler}
    />
  );

  render() {
    const { tests = [] } = this.props;

    return <div className={cx('failed-tests-table-body')}>{tests.map(this.renderRow)}</div>;
  }
}

export default FailedTestsTableBody;
