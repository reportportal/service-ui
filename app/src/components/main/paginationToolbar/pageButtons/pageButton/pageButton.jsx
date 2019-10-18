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
import classNames from 'classnames/bind';

import styles from './pageButton.scss';

const cx = classNames.bind(styles);

export const PageButton = ({ children, disabled, active, hideOnMobile, onClick }) => (
  <li
    className={cx('page-button', { active, disabled, hideOnMobile })}
    onClick={!disabled ? onClick : undefined}
  >
    {children}
  </li>
);

PageButton.propTypes = {
  children: PropTypes.node,
  disabled: PropTypes.bool,
  active: PropTypes.bool,
  hideOnMobile: PropTypes.bool,
  onClick: PropTypes.func,
};
PageButton.defaultProps = {
  children: null,
  disabled: false,
  active: false,
  hideOnMobile: false,
  onClick: () => {},
};
