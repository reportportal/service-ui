import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import styles from './retry.scss';

const cx = classNames.bind(styles);
const formatStatusClassName = (status = '') => `status-${status.toLowerCase()}`;

export const Retry = ({ retry, selected, index, onClick }) => (
  <div className={cx('retry', { selected })} onClick={onClick}>
    <div className={cx('status-indicator', formatStatusClassName(retry.status))} />
    <div className={cx('name')}>#{index}</div>
  </div>
);

Retry.propTypes = {
  retry: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  selected: PropTypes.bool,
  onClick: PropTypes.func,
};
Retry.defaultProps = {
  selected: false,
  onClick: () => {},
};
