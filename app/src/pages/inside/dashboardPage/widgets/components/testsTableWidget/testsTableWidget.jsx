import * as React from 'react';
import { func, string, element } from 'prop-types';
import classNames from 'classnames/bind';
import { LaunchInfoBlock } from './launchInfoBlock';
import { TestsTable } from './testsTable';
import { PTTests, PTColumns } from './pTypes';
import styles from './testsTableWidget.scss';

const cx = classNames.bind(styles);

export const TestsTableWidget = ({ launchName, tests, nameClickHandler, issueType, columns }) => (
  <div className={cx('tests-table-widget')}>
    <div className={cx('widget-wrapper')}>
      <LaunchInfoBlock launchName={launchName} issueType={issueType} />
      <TestsTable columns={columns} tests={tests} nameClickHandler={nameClickHandler} />
    </div>
  </div>
);

TestsTableWidget.propTypes = {
  launchName: string.isRequired,
  tests: PTTests.isRequired,
  nameClickHandler: func.isRequired,
  issueType: element,
  columns: PTColumns.isRequired,
};

TestsTableWidget.defaultProps = {
  issueType: null,
};
