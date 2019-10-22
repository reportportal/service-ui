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

import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { NavLink } from 'redux-first-router-link';
import { actionToPath, getOptions, history, selectLocationState } from 'redux-first-router';
import matchPath from 'rudy-match-path';
import { stripBasename } from 'rudy-history/PathUtils';

@connect((state) => ({
  location: selectLocationState(state),
}))
export class NavLinkWrapper extends Component {
  static propTypes = {
    to: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    className: PropTypes.string,
    activeClassName: PropTypes.string,
    children: PropTypes.node,
    onClick: PropTypes.func,
    location: PropTypes.object,
  };

  static defaultProps = {
    to: '/',
    className: '',
    activeClassName: '',
    children: null,
    onClick: () => {},
    location: null,
  };

  /*
   function that returns url from action and routesMap
   used in isActive methods, can be removed once isActive will be removed
   copied part of code from rudy-match
  */
  toUrl = (to, routesMap) => {
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
          // eslint-disable-next-line no-console
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
  isActive = () => {
    const { to, location } = this.props;
    const options = getOptions();
    const basename = options.basename ? options.basename : '';
    const path = this.toUrl(to, location.routesMap).split('?')[0];

    // deleting hash if it is present for correct matching
    const pathWOHash = path.indexOf('#') > -1 ? `/${path.split('#')[1]}` : path;

    return matchPath(location.pathname, stripBasename(pathWOHash, basename));
  };

  render() {
    const { onClick, children, to, className, activeClassName } = this.props;
    return (
      <NavLink
        to={to}
        className={className}
        activeClassName={activeClassName}
        onClick={onClick}
        isActive={this.isActive}
      >
        {children}
      </NavLink>
    );
  }
}
