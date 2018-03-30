import * as React from 'react';
import classNames from 'classnames/bind';
import FailedTestsInfoBlock from './failedTestsInfoBlock';
import FailedTestsTable from './failedTestsTable';
import { PTLaunch, PTTests } from './pTypes';
import styles from './failedTests.scss';

const cx = classNames.bind(styles);

function FlakyTests(props) {
  const { launch, tests } = props;

  return (
    <div className={cx('most-failed-test-cases')}>
      <div className={cx('widget-wrapper')}>
        <FailedTestsInfoBlock launchName={launch.name} />
        <FailedTestsTable
          tests={tests}
        />
      </div>
    </div>
  );
}


FlakyTests.propTypes = {
  launch: PTLaunch.isRequired,
  tests: PTTests.isRequired,
};

export default FlakyTests;
