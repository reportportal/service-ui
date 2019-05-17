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

import { actionToPath, getOptions, history, selectLocationState } from 'redux-first-router';
import matchPath from 'rudy-match-path';
import { stripBasename } from 'rudy-history/PathUtils';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames/bind';
import { NavLink } from 'redux-first-router-link';
import Parser from 'html-react-parser';
import styles from './sidebarButton.scss';

const cx = classNames.bind(styles);

export const SidebarButtonBase = ({ onClick, icon, children, link, bottom, location }) => {
  const classes = cx({
    'sidebar-nav-btn': true,
    'at-bottom': bottom,
  });

  /*
   function that returns url from action and routesMap
   used in isActive methods, can be removed once isActive will be removed
   copied part of code from rudy-match
  */
  const toUrl = (to, routesMap) => {
    if (typeof to === 'object') {
      const action = to;

      const { querySerializer } = getOptions();

      try {
        const path = actionToPath(action, routesMap, querySerializer);

        return history().createHref({
          pathname: path,
        });
      } catch (e) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(
            '[redux-first-router-link]could not create path from action:',
            action,
            'For reference,here are your current routes:',
            routesMap,
          );
        }
        return '#';
      }
    } else return '#';
  };

  /*
   custom method for workaround for bug in redux-first-router 2.1.1 version, where paths with hash does not activate active style
   can be removed once bug is fixed
  */
  const isActive = () => {
    const to = link;
    const options = getOptions();
    const basename = options.basename ? options.basename : '';
    const path = toUrl(to, location.routesMap).split('?')[0];

    // deleting hash if it is present for correct matching
    const pathWOHash = path.indexOf('#') > -1 ? `/${path.split('#')[1]}` : path;

    return matchPath(location.pathname, stripBasename(pathWOHash, basename));
  };

  return (
    <div className={classes}>
      <NavLink
        to={link}
        className={cx('nav-link')}
        activeClassName={cx('active')}
        onClick={onClick}
        isActive={isActive}
      >
        <span className={cx('wrapper')}>
          <i className={cx('btn-icon')}>{Parser(icon)}</i>
          <span className={cx('btn-title')}>{children}</span>
        </span>
      </NavLink>
    </div>
  );
};

SidebarButtonBase.propTypes = {
  link: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  icon: PropTypes.string,
  bottom: PropTypes.bool,
  children: PropTypes.node,
  onClick: PropTypes.func,
  location: PropTypes.object,
};

SidebarButtonBase.defaultProps = {
  link: '/',
  icon: '',
  bottom: false,
  children: null,
  onClick: () => {},
  location: null,
};

const mapStateToProps = (state) => ({ location: selectLocationState(state) });
export const SidebarButton = connect(mapStateToProps)(SidebarButtonBase);
