import { Component } from 'react';
import { func, string, number, array, object, oneOfType } from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { testCaseNameLinkSelector } from 'controllers/testItem';
import { AbsRelTime } from 'components/main/absRelTime';
import { NavLink } from 'components/main/navLink';
import { PTTest } from '../../pTypes';
import { Count } from '../count';
import styles from './testsTableRow.scss';

const cx = classNames.bind(styles);

@connect((state, ownProps) => ({
  testCaseNameLink: testCaseNameLinkSelector(state, {
    uniqueId: ownProps.data.uniqueId,
    testItemIds: ownProps.launchId,
  }),
}))
export class TestsTableRow extends Component {
  static propTypes = {
    launchId: oneOfType([number, string]).isRequired,
    testCaseNameLink: object.isRequired,
    data: PTTest.isRequired,
    name: string.isRequired,
    time: oneOfType([number, array]).isRequired,
    count: number,
    matrixData: array,
    matrixComponent: func,
    status: array,
    duration: number,
  };

  static defaultProps = {
    count: null,
    matrixData: null,
    matrixComponent: null,
    status: null,
    duration: null,
  };

  render() {
    const {
      testCaseNameLink,
      data,
      name,
      time,
      count,
      matrixData,
      matrixComponent: Matrix,
      status,
      duration,
    } = this.props;
    const { total, uniqueId } = data;
    const percentage = count !== null ? (count / total * 100).toFixed(2) : null;

    return (
      <div className={cx('row')}>
        <NavLink className={cx('col', 'col-name')} to={testCaseNameLink}>
          <span>{name}</span>
        </NavLink>
        {Matrix &&
          count && (
            <div className={cx('col', 'col-count')}>
              <Count count={count} total={total} />
              <Matrix tests={matrixData} id={uniqueId} />
            </div>
          )}
        {percentage && <div className={cx('col', 'col-percents')}>{percentage}%</div>}
        {status && <div className={cx('col', 'col-status')}>{status}</div>}
        {duration && <div className={cx('col', 'col-duration')}>{duration} s</div>}
        <div className={cx('col', 'col-date')}>
          <AbsRelTime startTime={Array.isArray(time) ? time[time.length - 1] : time} />
        </div>
      </div>
    );
  }
}
