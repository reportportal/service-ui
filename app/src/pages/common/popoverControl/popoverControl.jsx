/*
 * Copyright 2025 EPAM Systems
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

import { Popover } from '@reportportal/ui-kit';

import styles from './popoverControl.scss';

const cx = classNames.bind(styles);

export const PopoverControl = ({ items, placement, children, isOpened, setIsOpened }) => (
  <Popover
    className={cx('popover-control')}
    isOpened={isOpened}
    content={
      <ul>
        {items.map(({ label, icon, className = '', onClick }) => (
          <li key={label}>
            <button className={cx('popover-control__item-button', className)} onClick={onClick}>
              {icon} {label}
            </button>
          </li>
        ))}
      </ul>
    }
    placement={placement}
    setIsOpened={setIsOpened}
  >
    {children}
  </Popover>
);

PopoverControl.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      icon: PropTypes.element,
      className: PropTypes.string,
      onClick: PropTypes.func,
    }),
  ).isRequired,
  placement: PropTypes.string,
  children: PropTypes.node,
  isOpened: PropTypes.bool,
  setIsOpened: PropTypes.func,
};
