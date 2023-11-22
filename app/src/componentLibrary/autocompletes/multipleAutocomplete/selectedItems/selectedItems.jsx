/*
 * Copyright 2022 EPAM Systems
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

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import CrossIcon from 'common/img/cross-rounded-icon-inline.svg';
import styles from './selectedItems.scss';

const cx = classNames.bind(styles);

const SelectedItem = ({
  item,
  onRemoveItem,
  disabled,
  mobileDisabled,
  parseValueToString,
  error,
  editItem,
  editable,
  getAdditionalCreationCondition,
  storedOption,
  highlightUnStoredItem,
  variant,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [value, setValue] = useState('');

  const changeEditMode = () => {
    setValue(item);
    setEditMode(true);
  };
  const onChangeHandler = (e) => {
    setValue(e.target.value);
  };
  const onKeyDownHandler = (e) => {
    const creationCondition = getAdditionalCreationCondition(value);
    if (e.key === 'Enter' && creationCondition) {
      editItem(item, value);
      setEditMode(false);
      setValue('');
    }
  };
  const onBlurHandler = () => {
    setEditMode(false);
    setValue('');
  };

  /* eslint-disable jsx-a11y/no-autofocus */
  return editMode ? (
    <input
      autoFocus
      value={value}
      onChange={onChangeHandler}
      onKeyDown={onKeyDownHandler}
      onBlur={onBlurHandler}
      className={cx('input')}
    />
  ) : (
    <div
      className={cx('selected-item', variant, {
        [`validation-${error}`]: error,
        disabled,
        'mobile-disabled': mobileDisabled,
        'highlight-un-stored-item': highlightUnStoredItem && !storedOption,
      })}
      onClick={!disabled && editable && !storedOption ? changeEditMode : null}
    >
      {parseValueToString(item)}
      {!disabled && (
        <i
          className={cx('cross-icon', {
            [`validation-${error}`]: error,
            'mobile-disabled': mobileDisabled,
            disabled,
          })}
          onClick={(e) => {
            e.stopPropagation();
            onRemoveItem(item);
          }}
        >
          {Parser(CrossIcon)}
        </i>
      )}
    </div>
  );
};
SelectedItem.propTypes = {
  item: PropTypes.any.isRequired,
  onRemoveItem: PropTypes.func.isRequired,
  parseValueToString: PropTypes.func,
  editItem: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  mobileDisabled: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  editable: PropTypes.bool,
  getAdditionalCreationCondition: PropTypes.func,
  storedOption: PropTypes.bool,
  highlightUnStoredItem: PropTypes.bool,
  variant: PropTypes.oneOf(['light', 'dark']),
};

SelectedItem.defaultProps = {
  disabled: false,
  mobileDisabled: false,
  parseValueToString: (value) => value || '',
  error: false,
  editable: false,
  getAdditionalCreationCondition: () => true,
  storedOption: true,
  highlightUnStoredItem: false,
  variant: 'light',
};

export const SelectedItems = ({
  items,
  parseValueToString,
  getItemValidationErrorType,
  options,
  storedItemsMap,
  highlightUnStoredItem,
  ...props
}) =>
  (items || []).map((item) => {
    let errorType = '';
    if (getItemValidationErrorType) {
      errorType = getItemValidationErrorType(item);
    }
    return (
      <SelectedItem
        key={parseValueToString(item)}
        item={item}
        parseValueToString={parseValueToString}
        error={errorType}
        storedOption={!!storedItemsMap[item]}
        highlightUnStoredItem={highlightUnStoredItem}
        {...props}
      />
    );
  });

SelectedItems.propTypes = {
  items: PropTypes.array,
  onRemoveItem: PropTypes.func,
  parseValueToString: PropTypes.func,
  disabled: PropTypes.bool,
  mobileDisabled: PropTypes.bool,
  storedItemsMap: PropTypes.object,
  highlightUnStoredItem: PropTypes.bool,
};

SelectedItems.defaultProps = {
  items: [],
  onRemoveItem: () => {},
  disabled: false,
  mobileDisabled: false,
  parseValueToString: (value) => value || '',
  storedItemsMap: {},
  highlightUnStoredItem: false,
};
