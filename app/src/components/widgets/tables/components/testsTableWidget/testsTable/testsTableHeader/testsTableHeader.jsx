import * as React from 'react';
import classNames from 'classnames/bind';
import { PTColumns } from '../../pTypes';
import styles from './testsTableHeader.scss';

const cx = classNames.bind(styles);

function TestsTableHeader({ columns }) {
  const { name, count, percents, date, status, duration } = columns;

  return (
    <div className={cx('tests-table-header')}>
      <div className={cx('col', 'col-name')}>{name.header}</div>
      {count && (
        <div className={cx('col', 'col-count')}>
          <span className={cx('full')}>{count.header}</span>
          <span className={cx('short')}>{count.headerShort}</span>
        </div>
      )}
      {percents && (
        <div className={cx('col', 'col-percents')}>
          <span className={cx('full')}>{percents.header}</span>
          <span className={cx('short')}>{percents.headerShort}</span>
        </div>
      )}
      {status && (
        <div className={cx('col', 'col-status')}>
          <span className={cx('full')}>{status.header}</span>
          <span className={cx('short')}>{status.headerShort}</span>
        </div>
      )}
      {duration && (
        <div className={cx('col', 'col-duration')}>
          <span className={cx('full')}>{duration.header}</span>
          <span className={cx('short')}>{duration.headerShort}</span>
        </div>
      )}
      <div className={cx('col', 'col-date')}>{date.header}</div>
    </div>
  );
}

TestsTableHeader.propTypes = {
  columns: PTColumns.isRequired,
};

export { TestsTableHeader };
