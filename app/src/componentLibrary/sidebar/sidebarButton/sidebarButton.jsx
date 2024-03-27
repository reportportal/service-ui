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
import styles from './sidebarButton.scss';

const cx = classNames.bind(styles);

export const SidebarButton = ({
  className,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onMouseDown,
  children,
}) => (
  <button
    className={cx('sidebar-button', className)}
    onClick={onClick}
    tabIndex={-1}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    onMouseDown={onMouseDown}
  >
    {children}
  </button>
);

SidebarButton.propTypes = {
  className: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  children: PropTypes.element.isRequired,
  onMouseEnter: PropTypes.func.isRequired,
  onMouseLeave: PropTypes.func.isRequired,
  onMouseDown: PropTypes.func.isRequired,
};
