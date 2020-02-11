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

import React from 'react';
import Parser from 'html-react-parser';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import PlusIcon from 'common/img/plus-button-inline.svg';
import styles from './autocompleteOption.scss';

const cx = classNames.bind(styles);

export const AutocompleteOption = ({
  isActive,
  isSelected,
  children,
  isNew,
  disabled,
  ...props
}) => (
  <li
    className={cx('item', { active: isActive, selected: isSelected, new: isNew, disabled })}
    {...(!disabled ? props : {})}
  >
    <span className={cx('label')}>{children}</span>
    {isNew && <div className={cx('new-item-icon')}>{Parser(PlusIcon)}</div>}
  </li>
);

AutocompleteOption.propTypes = {
  isActive: PropTypes.bool,
  isSelected: PropTypes.bool,
  isNew: PropTypes.bool,
  children: PropTypes.node,
  disabled: PropTypes.bool,
};

AutocompleteOption.defaultProps = {
  isActive: false,
  isSelected: false,
  isNew: false,
  children: null,
  disabled: false,
};
