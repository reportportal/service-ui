/*
 * Copyright 2021 EPAM Systems
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

import React from 'react';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import DoneIcon from 'common/img/done-inline.svg';
import classNames from 'classnames/bind';
import styles from './actionButton.scss';

const cx = classNames.bind(styles);

export const ActionButton = ({ icon, btnLabel, btnHint, isSelected, handleClick, disabled }) => (
  <button
    className={cx('button', { selected: isSelected, disabled })}
    onClick={handleClick}
    title={btnHint}
    disabled={disabled}
  >
    <i className={cx('icon', { selected: isSelected })}>
      {isSelected ? Parser(DoneIcon) : icon && Parser(icon)}
    </i>
    <span className={cx('text', { selected: isSelected })}>{btnLabel}</span>
  </button>
);

ActionButton.propTypes = {
  icon: PropTypes.string,
  btnLabel: PropTypes.string,
  btnHint: PropTypes.string,
  isSelected: PropTypes.bool,
  handleClick: PropTypes.func,
  disabled: PropTypes.bool,
};
ActionButton.defaultProps = {
  icon: '',
  btnLabel: '',
  btnHint: '',
  isSelected: false,
  handleClick: () => {},
  disabled: false,
};
