import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { NavLink } from 'redux-first-router-link';

import styles from './linkItem.scss';

const cx = classNames.bind(styles);

export const LinkItem = ({ link, active, title }) =>
  !active ? (
    <NavLink className={cx('link')} to={link}>
      {title}
    </NavLink>
  ) : (
    <span>{title}</span>
  );
LinkItem.propTypes = {
  link: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  active: PropTypes.bool,
};
LinkItem.defaultProps = {
  active: false,
};
