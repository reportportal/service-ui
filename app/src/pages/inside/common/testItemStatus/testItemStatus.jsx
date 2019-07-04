import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './testItemStatus.scss';

const cx = classNames.bind(styles);

export const TestItemStatus = ({ status }) => (
  <div className={cx('status-container')}>
    <div className={cx('indicator', status.toLowerCase())} />
    <div className={cx('status')}>{status}</div>
  </div>
);

TestItemStatus.propTypes = {
  status: PropTypes.string,
};

TestItemStatus.defaultProps = {
  status: '',
};
