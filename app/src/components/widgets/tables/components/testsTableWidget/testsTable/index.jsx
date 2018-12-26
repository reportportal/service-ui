import * as React from 'react';
import { func } from 'prop-types';
import classNames from 'classnames/bind';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { TestsTableHeader } from './testsTableHeader';
import { TestsTableBody } from './testsTableBody';
import { PTTests, PTColumns } from '../pTypes';
import styles from './testsTable.scss';

const cx = classNames.bind(styles);

const TestsTable = ({ tests, nameClickHandler, columns }) => (
  <div className={cx('tests-table')}>
    <ScrollWrapper>
      <TestsTableHeader columns={columns} />
      <TestsTableBody columns={columns} tests={tests} nameClickHandler={nameClickHandler} />
    </ScrollWrapper>
  </div>
);

TestsTable.propTypes = {
  tests: PTTests.isRequired,
  nameClickHandler: func.isRequired,
  columns: PTColumns.isRequired,
};

export { TestsTable };
