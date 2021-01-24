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
import Link from 'redux-first-router-link';
import { NavLink } from 'components/main/navLink';
import { withTooltip } from 'components/main/tooltips/tooltip';
import styles from './sidebarButton.scss';

const cx = classNames.bind(styles);

const SidebarTooltip = ({ children }) => <div className={cx('sidebar-tooltip')}>{children}</div>;
SidebarTooltip.propTypes = {
  children: PropTypes.node.isRequired,
};

const SidebarButtonComponent = ({ onClick, icon, children, link, bottom, isNav, mobileHidden }) => {
  const classes = cx('sidebar-nav-btn', {
    'at-bottom': bottom,
    'mobile-hidden': mobileHidden,
  });

  const linkBody = (
    <span className={cx('wrapper')}>
      <i className={cx('btn-icon')}>{Parser(icon)}</i>
      <span className={cx('btn-title-mobile')}>{children}</span>
    </span>
  );

  return (
    <div className={classes}>
      {isNav ? (
        <NavLink
          to={link}
          className={cx('nav-link')}
          activeClassName={cx('active')}
          onClick={onClick}
        >
          {linkBody}
        </NavLink>
      ) : (
        <Link to={link} className={cx('link')} onClick={onClick}>
          {linkBody}
        </Link>
      )}
    </div>
  );
};
SidebarButtonComponent.propTypes = {
  link: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  icon: PropTypes.string,
  bottom: PropTypes.bool,
  children: PropTypes.node,
  isNav: PropTypes.bool,
  mobileHidden: PropTypes.bool,
  onClick: PropTypes.func,
};

SidebarButtonComponent.defaultProps = {
  link: '/',
  icon: '',
  bottom: false,
  children: null,
  isNav: true,
  mobileHidden: false,
  onClick: () => {},
};

export const SidebarButton = withTooltip({
  TooltipComponent: SidebarTooltip,
  data: {
    dynamicWidth: true,
    placement: 'right',
    tooltipTriggerClass: cx('tooltip-trigger'),
    noMobile: true,
    dark: true,
  },
})(SidebarButtonComponent);
