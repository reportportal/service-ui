/*
 * Copyright 2024 EPAM Systems
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

import { PropTypes } from 'prop-types';
import classNames from 'classnames/bind';
import { NavLink } from 'components/main/navLink';
import Parser from 'html-react-parser';
import styles from './sidebarButton.scss';

const cx = classNames.bind(styles);

export const SidebarButton = ({ icon, onClick, message, link }) => (
  <NavLink
    to={link}
    className={cx('sidebar-button')}
    activeClassName={cx('active')}
    onClick={onClick}
  >
    <i className={cx('btn-icon')}>{Parser(icon)}</i>
    <span className={cx('title')}>{message}</span>
  </NavLink>
);

SidebarButton.propTypes = {
  icon: PropTypes.element.isRequired,
  onClick: PropTypes.func.isRequired,
  message: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
};
