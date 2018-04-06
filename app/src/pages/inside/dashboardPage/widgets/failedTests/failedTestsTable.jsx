import * as React from 'react';
import { func } from 'prop-types';
import classNames from 'classnames/bind';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import FailedTestsTableHeader from './failedTestsTableHeader';
import FailedTestsTableBody from './failedTestsTableBody';
import { PTTests } from './pTypes';
import styles from './failedTests.scss';

const cx = classNames.bind(styles);

function FailedTestsTable({ tests, nameClickHandler }) {
  return (
    <div className={cx('failed-tests-table')}>
      <ScrollWrapper>
        <FailedTestsTableHeader />
        <FailedTestsTableBody
          tests={tests}
          nameClickHandler={nameClickHandler}
        />
      </ScrollWrapper>
    </div>
  );
}

FailedTestsTable.propTypes = {
  tests: PTTests.isRequired,
  nameClickHandler: func.isRequired,
};

export default FailedTestsTable;
