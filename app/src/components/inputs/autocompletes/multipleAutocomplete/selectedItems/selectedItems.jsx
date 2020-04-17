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
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import CrossIcon from 'common/img/cross-icon-inline.svg';
import classNames from 'classnames/bind';

import styles from './selectedItems.scss';

const cx = classNames.bind(styles);

const SelectedItem = ({ item, onRemoveItem, disabled, mobileDisabled, parseValueToString }) => (
  <div className={cx('selected-item', { disabled, 'mobile-disabled': mobileDisabled })}>
    <div className={cx('item-label')}>{parseValueToString(item)}</div>
    {!disabled && (
      <button
        className={cx('remove-btn', { 'mobile-disabled': mobileDisabled })}
        onClick={() => onRemoveItem(item)}
      >
        <i className={cx('cross-icon')}>{Parser(CrossIcon)}</i>
      </button>
    )}
  </div>
);

SelectedItem.propTypes = {
  item: PropTypes.any.isRequired,
  onRemoveItem: PropTypes.func.isRequired,
  parseValueToString: PropTypes.func,
  disabled: PropTypes.bool,
  mobileDisabled: PropTypes.bool,
};

SelectedItem.defaultProps = {
  disabled: false,
  mobileDisabled: false,
  parseValueToString: (value) => value || '',
};

export const SelectedItems = ({ items, parseValueToString, ...props }) =>
  (items || []).map((item) => (
    <SelectedItem
      key={parseValueToString(item)}
      item={item}
      parseValueToString={parseValueToString}
      {...props}
    />
  ));

SelectedItems.propTypes = {
  items: PropTypes.array,
  onRemoveItem: PropTypes.func,
  parseValueToString: PropTypes.func,
  disabled: PropTypes.bool,
  mobileDisabled: PropTypes.bool,
};

SelectedItems.defaultProps = {
  items: [],
  onRemoveItem: () => {},
  disabled: false,
  mobileDisabled: false,
  parseValueToString: (value) => value || '',
};
