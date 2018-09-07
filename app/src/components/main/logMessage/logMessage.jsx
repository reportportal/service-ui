import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './logMessage.scss';

const cx = classNames.bind(styles);

export const LogMessage = ({ item }) => (
  <div className={cx('log-message', { [`level-${item.level.toLowerCase()}`]: true })}>
    <div className={cx('message')}>{item.message}</div>
  </div>
);
LogMessage.propTypes = {
  item: PropTypes.shape({
    level: PropTypes.string,
    message: PropTypes.string,
  }).isRequired,
};
