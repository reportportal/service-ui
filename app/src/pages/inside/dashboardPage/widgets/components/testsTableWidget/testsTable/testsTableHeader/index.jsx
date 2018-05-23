import * as React from 'react';
import classNames from 'classnames/bind';
import { PTColumns } from '../../pTypes';
import styles from './testsTableHeader.scss';

const cx = classNames.bind(styles);

function TestsTableHeader({ columns }) {
  const { name, count, percents, date } = columns;
  return (
    <div className={cx('tests-table-header')}>
      <div className={cx('col', 'col-name')}>{name.header}</div>
      <div className={cx('col', 'col-count')}>
        <span className={cx('full')}>{count.header}</span>
        <span className={cx('short')}>{count.headerShort}</span>
      </div>
      <div className={cx('col', 'col-percents')}>
        <span className={cx('full')}>{percents.header}</span>
        <span className={cx('short')}>{percents.headerShort}</span>
      </div>
      <div className={cx('col', 'col-date')}>{date.header}</div>
    </div>
  );
}

TestsTableHeader.propTypes = {
  columns: PTColumns.isRequired,
};

export { TestsTableHeader };
