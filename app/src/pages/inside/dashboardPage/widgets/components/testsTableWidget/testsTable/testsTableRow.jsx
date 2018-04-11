import * as React from 'react';
import { func, string } from 'prop-types';
import classNames from 'classnames/bind';
import { AbsRelTime } from 'components/main/absRelTime';
import { PTTest } from '../pTypes';
import Count from './count';
import Matrix from './matrix';
import styles from '../testsTableWidget.scss';

const cx = classNames.bind(styles);

class TestsTableRow extends React.PureComponent {
  static propTypes = {
    data: PTTest.isRequired,
    nameClickHandler: func.isRequired,
    countKey: string.isRequired,
    matrixDataKey: string.isRequired,
  };

  nameClickHandler = () => {
    const { nameClickHandler, data } = this.props;
    nameClickHandler(data.uniqueId);
  };

  render() {
    const { data, countKey, matrixDataKey } = this.props;
    const { name, total, percentage, lastTime, uniqueId } = data;

    return (
      <div key={uniqueId} className={cx('row')}>
        <div className={cx('col', 'col-name')} onClick={this.nameClickHandler}>
          <span>{name}</span>
        </div>
        <div className={cx('col', 'col-count')}>
          <Count count={data[countKey]} total={total} />
          <Matrix tests={data[matrixDataKey]} id={uniqueId} />
        </div>
        <div className={cx('col', 'col-percents')}>{percentage}</div>
        <div className={cx('col', 'col-date')}>
          <AbsRelTime startTime={lastTime} />
        </div>
      </div>
    );
  }
}

export default TestsTableRow;
