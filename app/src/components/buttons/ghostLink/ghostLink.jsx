/*
 * Copyright 2017 EPAM Systems
 *
 *
 * This file is part of EPAM Report Portal.
 * https://github.com/reportportal/service-ui
 *
 * Report Portal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Report Portal is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Report Portal.  If not, see <http://www.gnu.org/licenses/>.
 */

import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import Link from 'redux-first-router-link';
import styles from './ghostLink.scss';

const cx = classNames.bind(styles);

export const GhostLink = ({
  to,
  target,
  children,
  title,
  color,
  icon,
  iconAtRight,
  onClick,
  tiny,
  notMinified,
  grayBorder,
}) => {
  const classes = cx({
    'ghost-link': true,
    tiny,
    [`color-${color}`]: color,
    'with-icon': icon,
    'mobile-minified': icon && children && !notMinified,
    'gray-border': grayBorder,
  });
  return (
    <Link to={to} className={classes} onClick={onClick} title={title} target={target}>
      {icon && (
        <i className={cx('icon', { 'only-icon': !children, 'icon-at-right': iconAtRight })}>
          {Parser(icon)}
        </i>
      )}
      {children && <span className={cx('text')}>{children}</span>}
    </Link>
  );
};

GhostLink.propTypes = {
  children: PropTypes.node,
  tiny: PropTypes.bool,
  iconAtRight: PropTypes.bool,
  notMinified: PropTypes.bool,
  title: PropTypes.string,
  color: PropTypes.string,
  icon: PropTypes.string,
  to: PropTypes.object,
  onClick: PropTypes.func,
  grayBorder: PropTypes.bool,
  target: PropTypes.string,
};

GhostLink.defaultProps = {
  children: null,
  tiny: false,
  iconAtRight: false,
  notMinified: false,
  title: '',
  color: 'topaz',
  icon: '',
  to: {},
  onClick: () => {},
  grayBorder: false,
  target: '_self',
};
