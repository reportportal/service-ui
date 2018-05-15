import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import styles from './hamburgerMenuItem.scss';

const cx = classNames.bind(styles);

export const HamburgerMenuItem = ({ onClick, text, disabled }) => (
  <div className={cx('hamburger-menu-item', { disabled })} onClick={disabled ? null : onClick}>
    {text}
  </div>
);
HamburgerMenuItem.propTypes = {
  onClick: PropTypes.func,
  text: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
};
HamburgerMenuItem.defaultProps = {
  onClick: () => {},
  disabled: false,
};
