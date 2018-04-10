import * as React from 'react';
import { func } from 'prop-types';
import classNames from 'classnames/bind';
import MostFailedTestsInfoBlock from './mostFailedTestsInfoBlock';
import MostFailedTestsTable from './mostFailedTestsTable';
import { PTLaunch, PTTests } from './pTypes';
import styles from './mostFailedTests.scss';

const cx = classNames.bind(styles);

function MostFailedTests(props) {
  const { launch, tests, nameClickHandler } = props;

  return (
    <div className={cx('most-failed-test-cases', { 'most-failed': launch.issueType })}>
      <div className={cx('widget-wrapper')}>
        <MostFailedTestsInfoBlock
          launchName={launch.name}
          issueType={launch.issueType}
        />
        <MostFailedTestsTable
          tests={tests}
          nameClickHandler={nameClickHandler}
        />
      </div>
    </div>
  );
}


MostFailedTests.propTypes = {
  launch: PTLaunch.isRequired,
  tests: PTTests.isRequired,
  nameClickHandler: func.isRequired,
};

export default MostFailedTests;
