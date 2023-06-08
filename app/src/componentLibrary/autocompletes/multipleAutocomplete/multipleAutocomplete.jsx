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

import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'fast-deep-equal';
import classNames from 'classnames/bind';
import { Manager, Reference, Popper } from 'react-popper';
import { AutocompleteMenu } from './../common/autocompleteMenu';
import { SelectedItems } from './selectedItems';
import { MultipleDownshift } from './multipleDownshift';
import styles from './multipleAutocomplete.scss';

const cx = classNames.bind(styles);

export const MultipleAutocomplete = ({
  onChange,
  onBlur,
  onFocus,
  parseValueToString,
  placeholder,
  disabled,
  error,
  touched,
  mobileDisabled,
  value = [],
  inputProps,
  onStateChange,
  customClass,
  maxLength,
  createWithoutConfirmation,
  options,
  getItemValidationErrorType,
  creatable,
  editable,
  getAdditionalCreationCondition,
  highlightUnStoredItem,
  parseInputValueFn,
  handleUnStoredItemCb,
  dataAutomationId,
  existingItemsMap,
  ...props
}) => {
  let updatePosition;
  const placeholderIfEmptyField = value.length === 0 && !disabled ? placeholder : '';
  const inputRef = useRef(null);

  const handleChange = (...args) => {
    updatePosition && updatePosition();
    onChange(...args);
  };
  const getOptionProps = (getItemProps, highlightedIndex, selectedItems) => ({
    item,
    index,
    ...rest
  }) =>
    getItemProps({
      item,
      index,
      isActive: highlightedIndex === index,
      isSelected: selectedItems.some((selectedItem) => isEqual(selectedItem, item)),
      ...rest,
    });
  const removeItemByBackspace = ({ event, removeItem, inputValue }) => {
    if (event.key === 'Backspace' && !inputValue && value.length) {
      removeItem(value[value.length - 1]);
    }
  };
  const createNewItem = ({ inputValue, selectItem, clearSelection }) => {
    if (parseInputValueFn) {
      const parsedItems = parseInputValueFn(inputValue);
      const items = parsedItems.length ? parsedItems : [inputValue];
      selectItem(items);
      clearSelection();
    } else {
      selectItem(inputValue);
      clearSelection();
    }
  };

  const onRemoveItem = (cb) => (item) => {
    cb(item);

    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <Manager>
      <MultipleDownshift
        onChange={handleChange}
        itemToString={parseValueToString}
        selectedItems={value}
        onStateChange={onStateChange}
        options={options}
        existingItemsMap={existingItemsMap}
        handleUnStoredItemCb={handleUnStoredItemCb}
      >
        {({
          getInputProps,
          getItemProps,
          isOpen,
          inputValue,
          highlightedIndex,
          removeItem,
          editItem,
          openMenu,
          selectItem,
          clearSelection,
          storedItemsMap,
        }) => (
          <div>
            <Reference>
              {({ ref }) => (
                <>
                  <div
                    ref={ref}
                    className={cx('autocomplete', customClass, {
                      'mobile-disabled': mobileDisabled,
                      error,
                      touched,
                      disabled,
                    })}
                  >
                    <div
                      className={cx('autocomplete-input', {
                        'mobile-disabled': mobileDisabled,
                      })}
                    >
                      <SelectedItems
                        items={value}
                        onRemoveItem={onRemoveItem(removeItem)}
                        disabled={disabled}
                        mobileDisabled={mobileDisabled}
                        parseValueToString={parseValueToString}
                        getItemValidationErrorType={getItemValidationErrorType}
                        editItem={editItem}
                        editable={editable}
                        getAdditionalCreationCondition={getAdditionalCreationCondition}
                        storedItemsMap={storedItemsMap}
                        highlightUnStoredItem={highlightUnStoredItem}
                      />
                      <input
                        {...getInputProps({
                          ref: inputRef,
                          placeholder: placeholderIfEmptyField,
                          maxLength,
                          onFocus: () => {
                            openMenu();
                            onFocus();
                          },
                          onKeyDown: (event) => {
                            const creationCondition =
                              event.key === 'Enter' &&
                              inputValue &&
                              creatable &&
                              getAdditionalCreationCondition(inputValue);
                            if (creationCondition) {
                              createNewItem({
                                inputValue,
                                selectItem,
                                clearSelection,
                              });
                            }
                            removeItemByBackspace({ event, removeItem, inputValue });
                          },
                          onBlur: () => {
                            onBlur();
                            const creationCondition =
                              inputValue && creatable && getAdditionalCreationCondition(inputValue);
                            if (creationCondition) {
                              createNewItem({
                                inputValue,
                                selectItem,
                                clearSelection,
                              });
                            }
                          },
                          disabled,
                          ...inputProps,
                        })}
                        className={cx('input', { disabled })}
                        data-automation-id={dataAutomationId}
                      />
                    </div>
                  </div>
                  {error && touched && <span className={cx('error-text')}>{error}</span>}
                </>
              )}
            </Reference>
            <Popper
              placement="bottom-start"
              modifiers={{
                preventOverflow: { enabled: true },
                flip: { enabled: true },
              }}
            >
              {({ placement, ref, style, scheduleUpdate }) => {
                updatePosition = scheduleUpdate;
                const filteredOptions = options.filter(
                  (item) =>
                    value.indexOf(item) < 0 && item.toLowerCase() !== inputValue.toLowerCase(),
                );
                return (
                  <AutocompleteMenu
                    isOpen={isOpen}
                    ref={ref}
                    placement={placement}
                    style={style}
                    inputValue={(inputValue || '').trim()}
                    getItemProps={getOptionProps(getItemProps, highlightedIndex, value)}
                    parseValueToString={parseValueToString}
                    createWithoutConfirmation={createWithoutConfirmation}
                    options={filteredOptions}
                    {...props}
                  />
                );
              }}
            </Popper>
          </div>
        )}
      </MultipleDownshift>
    </Manager>
  );
};
MultipleAutocomplete.propTypes = {
  options: PropTypes.array,
  loading: PropTypes.bool,
  onStateChange: PropTypes.func,
  value: PropTypes.array,
  placeholder: PropTypes.string,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  touched: PropTypes.bool,
  creatable: PropTypes.bool,
  editable: PropTypes.bool,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  disabled: PropTypes.bool,
  mobileDisabled: PropTypes.bool,
  inputProps: PropTypes.object,
  parseValueToString: PropTypes.func,
  minLength: PropTypes.number,
  maxLength: PropTypes.number,
  async: PropTypes.bool,
  customClass: PropTypes.string,
  createWithoutConfirmation: PropTypes.bool,
  getItemValidationErrorType: PropTypes.func,
  getAdditionalCreationCondition: PropTypes.func,
  highlightUnStoredItem: PropTypes.bool,
  parseInputValueFn: PropTypes.func,
  handleUnStoredItemCb: PropTypes.func,
  dataAutomationId: PropTypes.string,
  existingItemsMap: PropTypes.shape({
    value: PropTypes.bool,
  }),
};

MultipleAutocomplete.defaultProps = {
  options: [],
  loading: false,
  onStateChange: () => {},
  value: [],
  placeholder: '',
  error: '',
  touched: false,
  creatable: false,
  editable: false,
  onChange: () => {},
  onFocus: () => {},
  onBlur: () => {},
  disabled: false,
  mobileDisabled: false,
  inputProps: {},
  parseValueToString: (value) => value || '',
  minLength: 1,
  maxLength: null,
  async: false,
  customClass: '',
  createWithoutConfirmation: false,
  getItemValidationErrorType: null,
  getAdditionalCreationCondition: () => true,
  highlightUnStoredItem: false,
  parseInputValueFn: null,
  handleUnStoredItemCb: null,
  dataAutomationId: '',
  existingItemsMap: {},
};
