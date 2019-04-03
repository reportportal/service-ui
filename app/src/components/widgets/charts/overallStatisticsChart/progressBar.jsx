import { PropTypes } from 'prop-types';
import classNames from 'classnames/bind';
import styles from './progressBar.scss';

const cx = classNames.bind(styles);

export class ProgressBar extends React.PureComponent {
  static propTypes = {
    progressData: PropTypes.object.isRequired,
  };

  render() {
    const { total, passed, failed, skipped } = this.props.progressData;
    const getPercentage = (value, totalVal) => `${value / totalVal * 100}%`;
    return (
      <div className={cx('container')}>
        <div style={{ width: getPercentage(passed, total) }} className={cx('passed')} />
        <div style={{ width: getPercentage(failed, total) }} className={cx('failed')} />
        <div style={{ width: getPercentage(skipped, total) }} className={cx('skipped')} />
      </div>
    );
  }
}
