import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './statisticsItem.scss';

const cx = classNames.bind(styles);
export const StatisticsItem = ({ caption, value }) => (
  <div className={cx('statistic-item')}>
    <div className={cx('caption')}>{caption}</div>
    <div className={cx('value')}>{value}</div>
  </div>
);

StatisticsItem.propTypes = {
  caption: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

StatisticsItem.defaultProps = {
  value: '0',
};
