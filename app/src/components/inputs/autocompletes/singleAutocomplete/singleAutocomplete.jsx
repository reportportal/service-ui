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
import Downshift from 'downshift';
import Parser from 'html-react-parser';
import CrossIcon from 'common/img/cross-icon-inline.svg';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { Manager, Reference, Popper } from 'react-popper';
import { AutocompleteMenu } from './../common/autocompleteMenu';
import styles from './singleAutocomplete.scss';

const cx = classNames.bind(styles);

export class SingleAutocomplete extends Component {
  static propTypes = {
    options: PropTypes.array,
    loading: PropTypes.bool,
    onStateChange: PropTypes.func,
    value: PropTypes.any,
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
    value: '',
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

  getOptionProps = (getItemProps, highlightedIndex, selectedItem) => ({ item, index, ...rest }) =>
    getItemProps({
      item,
      index,
      isActive: highlightedIndex === index,
      isSelected: selectedItem === item,
      ...rest,
    });

  render() {
    const {
      onStateChange,
      onChange,
      onBlur,
      onFocus,
      parseValueToString,
      placeholder,
      disabled,
      error,
      touched,
      mobileDisabled,
      value,
      inputProps,
      customClass,
      ...props
    } = this.props;
    return (
      <Manager>
        <Downshift
          onChange={onChange}
          itemToString={parseValueToString}
          selectedItem={value}
          onStateChange={onStateChange}
        >
          {({
            getInputProps,
            getItemProps,
            isOpen,
            clearSelection,
            selectedItem,
            inputValue,
            highlightedIndex,
            openMenu,
          }) => (
            <div className={cx('autocomplete-container')}>
              <Reference>
                {({ ref }) => (
                  <div ref={ref} className={cx('autocomplete', customClass)}>
                    <input
                      {...getInputProps({
                        placeholder: !disabled ? placeholder : '',
                        onFocus: () => {
                          !value && openMenu();
                          onFocus();
                        },
                        onBlur,
                        disabled,
                        ...inputProps,
                      })}
                      className={cx('input', {
                        'mobile-disabled': mobileDisabled,
                        error,
                        touched,
                        disabled,
                      })}
                    />
                    {selectedItem && !disabled && (
                      <button
                        className={cx('input-control-btn', { 'mobile-disabled': mobileDisabled })}
                        onClick={clearSelection}
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
                {({ placement, ref, style }) => (
                  <AutocompleteMenu
                    isOpen={isOpen}
                    placement={placement}
                    style={style}
                    ref={ref}
                    inputValue={(inputValue || '').trim()}
                    getItemProps={this.getOptionProps(getItemProps, highlightedIndex, value)}
                    parseValueToString={parseValueToString}
                    {...props}
                  />
                )}
              </Popper>
            </div>
          )}
        </Downshift>
      </Manager>
    );
  }
}
