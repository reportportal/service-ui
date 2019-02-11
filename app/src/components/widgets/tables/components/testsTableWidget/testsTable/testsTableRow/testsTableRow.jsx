import { Component } from 'react';
import { func, string, number, array, object, oneOfType } from 'prop-types';
import classNames from 'classnames/bind';
import { connect } from 'react-redux';
import { NavLink } from 'redux-first-router-link';
import { testCaseNameLinkSelector } from 'controllers/testItem';
import { AbsRelTime } from 'components/main/absRelTime';
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
    testCaseNameLink: object.isRequired,
    data: PTTest.isRequired,
    name: string.isRequired,
    count: number.isRequired,
    time: oneOfType([number, array]).isRequired,
    matrixData: array.isRequired,
    matrixComponent: func.isRequired,
    launchId: oneOfType([number, string]).isRequired,
  };

  render() {
    const { data, count, name, matrixData, time, matrixComponent, testCaseNameLink } = this.props;
    const { total, uniqueId } = data;
    const Matrix = matrixComponent;
    const percentage = (count / total * 100).toFixed(2);

    return (
      <div className={cx('row')}>
        <NavLink className={cx('col', 'col-name')} to={testCaseNameLink}>
          <span>{name}</span>
        </NavLink>
        <div className={cx('col', 'col-count')}>
          <Count count={count} total={total} />
          <Matrix tests={matrixData} id={uniqueId} />
        </div>
        <div className={cx('col', 'col-percents')}>{percentage}%</div>
        <div className={cx('col', 'col-date')}>
          <AbsRelTime startTime={Array.isArray(time) ? time[time.length - 1] : time} />
        </div>
      </div>
    );
  }
}
