import * as React from 'react';
import { object, element, bool } from 'prop-types';
import classNames from 'classnames/bind';
import { LaunchInfoBlock } from './launchInfoBlock';
import { TestsTable } from './testsTable';
import { PTTests, PTColumns } from './pTypes';
import styles from './testsTableWidget.scss';

const cx = classNames.bind(styles);

export const TestsTableWidget = ({ launch, tests, issueType, columns, hideInfoBlock }) => {
  const launchName = launch.number ? `${launch.name} #${launch.number}` : launch.name;

  return (
    <div className={cx('tests-table-widget')}>
      <div className={cx('widget-wrapper')}>
        {!hideInfoBlock && <LaunchInfoBlock launchName={launchName} issueType={issueType} />}
        <TestsTable columns={columns} tests={tests} launchId={launch.id} />
      </div>
    </div>
  );
};

TestsTableWidget.propTypes = {
  launch: object.isRequired,
  tests: PTTests.isRequired,
  issueType: element,
  columns: PTColumns.isRequired,
  hideInfoBlock: bool,
};

TestsTableWidget.defaultProps = {
  issueType: null,
  hideInfoBlock: false,
};
