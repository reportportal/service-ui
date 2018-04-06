import * as React from 'react';
import { func } from 'prop-types';
import classNames from 'classnames/bind';
import FailedTestsInfoBlock from './failedTestsInfoBlock';
import FailedTestsTable from './failedTestsTable';
import { PTLaunch, PTTests } from './pTypes';
import styles from './failedTests.scss';

const cx = classNames.bind(styles);

function FlakyTests(props) {
  const { launch, tests, nameClickHandler } = props;

  return (
    <div className={cx('failed-test-cases', { 'most-failed': launch.type })}>
      <div className={cx('widget-wrapper')}>
        <FailedTestsInfoBlock
          launchName={launch.name}
          type={launch.type}
        />
        <FailedTestsTable
          tests={tests}
          nameClickHandler={nameClickHandler}
        />
      </div>
    </div>
  );
}


FlakyTests.propTypes = {
  launch: PTLaunch.isRequired,
  tests: PTTests.isRequired,
  nameClickHandler: func.isRequired,
};

export default FlakyTests;
