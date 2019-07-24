import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './checkIcon.scss';

const cx = classNames.bind(styles);

export const CheckIcon = ({ disabled, centered, checked }) => (
  <div className={cx('square', { centered, checked, disabled })}>
    <svg
      className={cx('icon')}
      xmlns="http://www.w3.org/2000/svg"
      width="9"
      height="10"
      viewBox="0 0 8 7"
    >
      <polygon
        fill={disabled ? '#999' : '#fff'}
        fillRule="evenodd"
        points="0 3.111 3 6.222 8 1.037 7 0 3 4.148 1 2.074"
      />
    </svg>
  </div>
);

CheckIcon.propTypes = {
  disabled: PropTypes.bool,
  centered: PropTypes.bool,
  checked: PropTypes.bool,
};

CheckIcon.defaultProps = {
  disabled: false,
  centered: PropTypes.bool,
  checked: PropTypes.bool,
};
