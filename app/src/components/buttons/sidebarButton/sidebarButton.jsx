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
import React from 'react';
import classNames from 'classnames/bind';
import { NavLink } from 'react-router-dom';
import Parser from 'html-react-parser';
import styles from './sidebarButton.scss';

const cx = classNames.bind(styles);

export const SidebarButton = ({ onClick, icon, children, link, bottom }) => {
  const classes = cx({
    'sidebar-nav-btn': true,
    'at-bottom': bottom,
  });
  return (
    <div className={classes}>
      <NavLink to={link} className={cx('nav-link')} activeClassName={cx('active')} onClick={onClick} >
        <span className={cx('wrapper')}>
          <i className={cx('btn-icon')}>
            { Parser(icon) }
          </i>
          <span className={cx('btn-title')}>
            {children}
          </span>
        </span>
      </NavLink>
    </div>
  );
};

SidebarButton.propTypes = {
  link: PropTypes.string,
  icon: PropTypes.string,
  bottom: PropTypes.bool,
  children: PropTypes.node,
  onClick: PropTypes.func,
};

SidebarButton.defaultProps = {
  link: '/',
  icon: '',
  bottom: false,
  children: null,
  onClick: () => {},
};

