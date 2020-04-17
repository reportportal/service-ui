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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'fast-deep-equal';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import CrossIcon from 'common/img/cross-icon-inline.svg';
import { Manager, Reference, Popper } from 'react-popper';
import { AutocompleteMenu } from './../common/autocompleteMenu';
import { SelectedItems } from './selectedItems';
import { MultipleDownshift } from './multipleDownshift';
import styles from './multipleAutocomplete.scss';

const cx = classNames.bind(styles);

export class MultipleAutocomplete extends Component {
  static propTypes = {
    options: PropTypes.array,
    loading: PropTypes.bool,
    onStateChange: PropTypes.func,
    value: PropTypes.array,
    placeholder: PropTypes.string,
    error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    touched: PropTypes.bool,
    creatable: PropTypes.bool,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    isValidNewOption: PropTypes.func,
    disabled: PropTypes.bool,
    mobileDisabled: PropTypes.bool,
    inputProps: PropTypes.object,
    parseValueToString: PropTypes.func,
    renderOption: PropTypes.func,
    createNewOption: PropTypes.func,
    minLength: PropTypes.number,
    async: PropTypes.bool,
    notFoundPrompt: PropTypes.node,
    beforeSearchPrompt: PropTypes.node,
    showDynamicSearchPrompt: PropTypes.bool,
    customClass: PropTypes.string,
    isOptionUnique: PropTypes.func,
  };

  static defaultProps = {
    options: [],
    loading: false,
    onStateChange: () => {},
    value: [],
    placeholder: '',
    error: '',
    touched: false,
    creatable: false,
    onChange: () => {},
    isValidNewOption: () => true,
    onFocus: () => {},
    onBlur: () => {},
    disabled: false,
    mobileDisabled: false,
    inputProps: {},
    parseValueToString: (value) => value || '',
    renderOption: null,
    createNewOption: (inputValue) => inputValue,
    minLength: 1,
    async: false,
    customClass: '',
    isOptionUnique: null,
  };

  state = {
    focused: false,
  };

  getOptionProps = (getItemProps, highlightedIndex, selectedItems) => ({ item, index, ...rest }) =>
    getItemProps({
      item,
      index,
      isActive: highlightedIndex === index,
      isSelected: selectedItems.some((selectedItem) => isEqual(selectedItem, item)),
      ...rest,
    });

  handleChange = (...args) => {
    this.updatePosition && this.updatePosition();
    this.props.onChange(...args);
  };

  render() {
    const {
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
      ...props
    } = this.props;
    const { focused } = this.state;
    const isClearable = !!(value && value.length && !disabled);
    return (
      <Manager>
        <MultipleDownshift
          onChange={this.handleChange}
          itemToString={parseValueToString}
          selectedItems={value}
          onStateChange={onStateChange}
        >
          {({
            getInputProps,
            getItemProps,
            isOpen,
            inputValue,
            highlightedIndex,
            removeItem,
            removeAllItems,
            openMenu,
          }) => (
            <div className={cx('autocomplete-container')}>
              <Reference>
                {({ ref }) => (
                  <div
                    ref={ref}
                    className={cx('autocomplete', customClass, {
                      'mobile-disabled': mobileDisabled,
                      error,
                      touched,
                      focused,
                      disabled,
                    })}
                  >
                    <div
                      className={cx('autocomplete-input', {
                        clearable: isClearable,
                        'mobile-disabled': mobileDisabled,
                      })}
                    >
                      <SelectedItems
                        items={value}
                        onRemoveItem={removeItem}
                        disabled={disabled}
                        mobileDisabled={mobileDisabled}
                        parseValueToString={parseValueToString}
                      />
                      <input
                        {...getInputProps({
                          placeholder: !disabled ? placeholder : '',
                          onFocus: () => {
                            this.setState({
                              focused: true,
                            });
                            openMenu();
                            onFocus();
                          },
                          onKeyDown: (event) => {
                            if (event.key === 'Backspace' && !inputValue && value.length) {
                              removeItem(value[value.length - 1]);
                            }
                          },
                          onBlur: () => {
                            this.setState({
                              focused: false,
                            });
                            onBlur();
                          },
                          disabled,
                          ...inputProps,
                        })}
                        className={cx('input', { disabled })}
                      />
                    </div>
                    {isClearable && (
                      <button
                        className={cx('input-control-btn', { 'mobile-disabled': mobileDisabled })}
                        onClick={removeAllItems}
                      >
                        <i className={cx('cross-icon')}>{Parser(CrossIcon)}</i>
                      </button>
                    )}
                  </div>
                )}
              </Reference>
              <Popper
                placement="bottom-start"
                modifiers={{
                  preventOverflow: { enabled: true },
                  flip: {
                    enabled: true,
                  },
                }}
              >
                {({ placement, ref, style, scheduleUpdate }) => {
                  this.updatePosition = scheduleUpdate;
                  return (
                    <AutocompleteMenu
                      isOpen={isOpen}
                      ref={ref}
                      placement={placement}
                      style={style}
                      inputValue={(inputValue || '').trim()}
                      getItemProps={this.getOptionProps(getItemProps, highlightedIndex, value)}
                      parseValueToString={parseValueToString}
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
  }
}
