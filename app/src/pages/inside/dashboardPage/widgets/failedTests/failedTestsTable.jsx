import * as React from 'react';
import classNames from 'classnames/bind';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import FailedTestsTableHeader from './failedTestsTableHeader';
import FailedTestsTableBody from './failedTestsTableBody';
import { PTTests } from './pTypes';
import styles from './failedTests.scss';

const cx = classNames.bind(styles);

function FailedTestsTable({ tests }) {
  return (
    <div className={cx('most-failed-table')}>
      <ScrollWrapper>
        <FailedTestsTableHeader />
        <FailedTestsTableBody tests={tests} />
      </ScrollWrapper>
    </div>
  );
}

FailedTestsTable.propTypes = {
  tests: PTTests.isRequired,
};

export default FailedTestsTable;
