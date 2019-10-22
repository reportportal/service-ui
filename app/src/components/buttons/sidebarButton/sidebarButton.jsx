/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { NavLink } from 'components/main/navLink';
import styles from './sidebarButton.scss';

const cx = classNames.bind(styles);

export const SidebarButton = ({ onClick, icon, children, link, bottom }) => {
  const classes = cx({
    'sidebar-nav-btn': true,
    'at-bottom': bottom,
  });

  return (
    <div className={classes}>
      <NavLink
        to={link}
        className={cx('nav-link')}
        activeClassName={cx('active')}
        onClick={onClick}
      >
        <span className={cx('wrapper')}>
          <i className={cx('btn-icon')}>{Parser(icon)}</i>
          <span className={cx('btn-title')}>{children}</span>
        </span>
      </NavLink>
    </div>
  );
};

SidebarButton.propTypes = {
  link: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
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
