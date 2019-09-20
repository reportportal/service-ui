import { PropTypes } from 'prop-types';
import classNames from 'classnames/bind';
import { FAILED, INTERRUPTED, SKIPPED, PASSED } from 'common/constants/testStatuses';
import styles from './progressBar.scss';

const cx = classNames.bind(styles);

export class ProgressBar extends React.PureComponent {
  static propTypes = {
    progressData: PropTypes.object.isRequired,
    onChartClick: PropTypes.func.isRequired,
  };

  static getPercentage = (value, totalVal) => `${value / totalVal * 100}%`;

  render() {
    const { total, passed, failed, skipped } = this.props.progressData;
    const { getPercentage } = ProgressBar;

    return (
      <div className={cx('container')}>
        <div
          onClick={() => this.props.onChartClick(PASSED)}
          style={{ width: getPercentage(passed, total) }}
          className={cx('passed')}
        />
        <div
          onClick={() => this.props.onChartClick(FAILED, INTERRUPTED)}
          style={{ width: getPercentage(failed, total) }}
          className={cx('failed')}
        />
        <div
          onClick={() => this.props.onChartClick(SKIPPED)}
          style={{ width: getPercentage(skipped, total) }}
          className={cx('skipped')}
        />
      </div>
    );
  }
}
