import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { NavLink } from 'components/main/navLink';

import styles from './linkItem.scss';

const cx = classNames.bind(styles);

export const LinkItem = ({ link, active, title, onClick }) =>
  !active ? (
    <NavLink className={cx('link')} to={link} onClick={onClick}>
      {title}
    </NavLink>
  ) : (
    <span>{title}</span>
  );
LinkItem.propTypes = {
  link: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  active: PropTypes.bool,
  onClick: PropTypes.func,
};
LinkItem.defaultProps = {
  active: false,
  onClick: () => {},
};
