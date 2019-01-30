import * as React from 'react';
import classNames from 'classnames/bind';
import { number, string, oneOfType } from 'prop-types';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { TestsTableHeader } from './testsTableHeader';
import { TestsTableBody } from './testsTableBody';
import { PTTests, PTColumns } from '../pTypes';
import styles from './testsTable.scss';

const cx = classNames.bind(styles);

export const TestsTable = ({ tests, columns, launchId }) => (
  <div className={cx('tests-table')}>
    <ScrollWrapper>
      <TestsTableHeader columns={columns} />
      <TestsTableBody columns={columns} tests={tests} launchId={launchId} />
    </ScrollWrapper>
  </div>
);

TestsTable.propTypes = {
  tests: PTTests.isRequired,
  columns: PTColumns.isRequired,
  launchId: oneOfType([number, string]).isRequired,
};
