import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import styles from './hamburgerMenuItem.scss';

const cx = classNames.bind(styles);

export const HamburgerMenuItem = ({ onClick, text, title, disabled }) => (
  <div
    className={cx('hamburger-menu-item', { disabled })}
    title={title}
    onClick={!disabled ? onClick : undefined}
  >
    {text}
  </div>
);
HamburgerMenuItem.propTypes = {
  onClick: PropTypes.func,
  text: PropTypes.string.isRequired,
  title: PropTypes.string,
  disabled: PropTypes.bool,
};
HamburgerMenuItem.defaultProps = {
  onClick: () => {},
  title: '',
  disabled: false,
};
