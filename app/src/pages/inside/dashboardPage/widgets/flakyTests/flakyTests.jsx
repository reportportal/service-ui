import * as React from 'react';
import { string, shape, arrayOf, bool, number } from 'prop-types';
import classNames from 'classnames/bind';
import FlakyTestsInfoBlock from './flakyTestsInfoBlock';
import FlakyTestsTable from './flakyTestsTable';
import styles from './flakyTests.scss';

const cx = classNames.bind(styles);

function FlakyTests(props) {
  const { launch, failed, test } = props;

  return (
    <div className={cx('most-failed-test-cases')}>
      <div className={cx('widget-wrapper')}>
        <FlakyTestsInfoBlock launchName={launch.name} />
        <FlakyTestsTable
          tests={failed}
        />
      </div>
    </div>
  );
}

const PTLaunch = shape({
  id: string.isRequired,
  name: string.isRequired,
  number: string.isRequired,
});

const PTFailed = shape({
  name: string.isRequired,
  uniqueId: string.isRequired,
  percentage: string.isRequired,
  isFailed: arrayOf(bool).isRequired,
  total: number.isRequired,
  failedCount: number.isRequired,
});


FlakyTests.propTypes = {
  launch: PTLaunch.isRequired,
  failed: arrayOf(PTFailed).isRequired,
};

export default FlakyTests;
