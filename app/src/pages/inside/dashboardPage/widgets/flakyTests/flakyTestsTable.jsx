import * as React from 'react';
import classNames from 'classnames/bind';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import FlakyTestsTableHeader from './flakyTestTableHeader';
import styles from './flakyTests.scss';

const cx = classNames.bind(styles);

function FlakyTestsTable() {
  return (
    <div className={cx('most-failed-table')}>
      <ScrollWrapper>
        <FlakyTestsTableHeader />
      </ScrollWrapper>
    </div>
  );
}

export default FlakyTestsTable;
