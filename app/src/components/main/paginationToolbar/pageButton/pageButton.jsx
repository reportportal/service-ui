import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import styles from './pageButton.scss';

const cx = classNames.bind(styles);

export const PageButton = ({ children, disabled, active, onClick }) => (
  <li
    className={cx('page-button', { active, disabled })}
    onClick={!disabled ? onClick : undefined}
  >
    {children}
  </li>
);

PageButton.propTypes = {
  children: PropTypes.node,
  disabled: PropTypes.bool,
  active: PropTypes.bool,
  onClick: PropTypes.func,
};
PageButton.defaultProps = {
  children: null,
  disabled: false,
  active: false,
  onClick: () => {
  },
};
