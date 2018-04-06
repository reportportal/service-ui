import * as React from 'react';
import classNames from 'classnames/bind';
import { AbsRelTime } from 'components/main/absRelTime';
import { PTTests } from './pTypes';
import styles from './failedTests.scss';

const cx = classNames.bind(styles);

// TODO: add links, extract count column into component

class FailedTestsTableBody extends React.PureComponent {

  static propTypes = {
    tests: PTTests.isRequired,
  }

  renderRow = (test) => {
    const {
      name, total, isFailed, percentage,
      lastTime, uniqueId,
    } = test;

    return (
      <div key={uniqueId} className={cx('row')}>
        <div className={cx('col', 'col-name')}><span>{name}</span></div>
        <div className={cx('col', 'col-count')}>
          <div className={cx('count')}>{total}</div>
          <div className={cx('matrix')}>
            <div className={cx('squares-wrapper')}>
              {
                /* eslint-disable */
                isFailed.map((failed, idx) => <div key={`${uniqueId}-square-${idx}`} className={cx('square', { failed })} />)
                /* eslint-disable */
              }
            </div>
          </div>
        </div>
        <div className={cx('col', 'col-percents')}>{percentage}</div>
        <div className={cx('col', 'col-date')} data-js-date>
          <AbsRelTime
            startTime={lastTime}
          />
        </div>
      </div>
    );
  }

  render() {
    const { tests = [] } = this.props;

    return (
      <div className={cx('most-failed-table-body')}>
        {tests.map(this.renderRow)}
      </div>
    );
  }
}

export default FailedTestsTableBody;
