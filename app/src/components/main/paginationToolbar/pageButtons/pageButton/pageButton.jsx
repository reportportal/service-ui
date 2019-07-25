import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import styles from './pageButton.scss';

const cx = classNames.bind(styles);

export const PageButton = ({ children, disabled, active, hideOnMobile, onClick }) => (
  <li
    className={cx('page-button', { active, disabled, hideOnMobile })}
    onClick={!disabled ? onClick : undefined}
  >
    {children}
  </li>
);

PageButton.propTypes = {
  children: PropTypes.node,
  disabled: PropTypes.bool,
  active: PropTypes.bool,
  hideOnMobile: PropTypes.bool,
  onClick: PropTypes.func,
};
PageButton.defaultProps = {
  children: null,
  disabled: false,
  active: false,
  hideOnMobile: false,
  onClick: () => {},
};
