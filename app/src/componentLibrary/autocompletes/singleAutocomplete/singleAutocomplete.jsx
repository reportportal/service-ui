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

import React, { Component } from 'react';
import Downshift from 'downshift';
import PropTypes from 'prop-types';
import { Manager, Reference, Popper } from 'react-popper';
import { FieldText } from 'componentLibrary/fieldText';
import { TAB_KEY_CODE } from 'common/constants/keyCodes';
import { AutocompleteMenu } from './../common/autocompleteMenu';

const DEFAULT_OPTIONS_INDEX = 0;

export class SingleAutocomplete extends Component {
  static propTypes = {
    options: PropTypes.array,
    loading: PropTypes.bool,
    onStateChange: PropTypes.func,
    value: PropTypes.any,
    placeholder: PropTypes.string,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    disabled: PropTypes.bool,
    inputProps: PropTypes.object,
    parseValueToString: PropTypes.func,
    renderOption: PropTypes.func,
    minLength: PropTypes.number,
    maxLength: PropTypes.number,
    async: PropTypes.bool,
    autocompleteVariant: PropTypes.string,
    isRequired: PropTypes.bool,
    error: PropTypes.string,
    touched: PropTypes.bool,
    setTouch: PropTypes.func,
    createWithoutConfirmation: PropTypes.bool,
    menuClassName: PropTypes.string,
    icon: PropTypes.string,
    isOptionUnique: PropTypes.func,
    refFunction: PropTypes.func,
  };

  static defaultProps = {
    options: [],
    loading: false,
    value: '',
    placeholder: '',
    onChange: () => {},
    onFocus: () => {},
    onBlur: () => {},
    disabled: false,
    inputProps: {},
    parseValueToString: (value) => value || '',
    renderOption: null,
    minLength: 1,
    maxLength: null,
    async: false,
    autocompleteVariant: '',
    isRequired: false,
    error: '',
    touched: false,
    setTouch: () => {},
    createWithoutConfirmation: false,
    menuClassName: '',
    icon: null,
    isOptionUnique: null,
    refFunction: () => {},
  };

  getOptionProps = (getItemProps, highlightedIndex, selectedItem) => ({ item, index, ...rest }) =>
    getItemProps({
      item,
      index,
      isActive: highlightedIndex === index,
      isSelected: selectedItem === item,
      ...rest,
    });

  handleKeyDown = (event, setHighlightedIndex) => {
    if (event.keyCode === TAB_KEY_CODE) {
      event.preventDefault();
      setHighlightedIndex(this.props.options.length);
    }
  };

  render() {
    const {
      onStateChange,
      onChange,
      onBlur,
      onFocus,
      parseValueToString,
      placeholder,
      disabled,
      value,
      inputProps,
      maxLength,
      autocompleteVariant,
      isRequired,
      error,
      touched,
      setTouch,
      createWithoutConfirmation,
      menuClassName,
      icon,
      options,
      isOptionUnique,
      refFunction,
      ...props
    } = this.props;
    return (
      <Manager>
        <Downshift
          onChange={onChange}
          itemToString={parseValueToString}
          selectedItem={value}
          onStateChange={onStateChange}
          defaultHighlightedIndex={DEFAULT_OPTIONS_INDEX}
        >
          {({
            getInputProps,
            getItemProps,
            setHighlightedIndex,
            isOpen,
            inputValue,
            highlightedIndex,
            selectItem,
          }) => (
            <div>
              <Reference>
                {({ ref }) => (
                  <div ref={ref}>
                    <FieldText
                      {...getInputProps({
                        placeholder: !disabled ? placeholder : '',
                        maxLength,
                        onFocus: () => {
                          onFocus();
                        },
                        refFunction,
                        onKeyDown: (event) => {
                          if (inputValue && isOpen) {
                            this.handleKeyDown(event, setHighlightedIndex);
                          }
                        },
                        onBlur: (e) => {
                          const newValue = inputValue.trim();

                          if (!createWithoutConfirmation && !newValue) {
                            selectItem(newValue);
                          }

                          if (createWithoutConfirmation) {
                            selectItem(newValue);
                          }
                          onBlur(e);
                          isOptionUnique &&
                            isOptionUnique(newValue ? !options.find((v) => v === newValue) : null);
                          setTouch(true);
                        },
                        disabled,
                        defaultWidth: false,
                        isRequired,
                        touched,
                        error,
                        endIcon: icon,
                        ...inputProps,
                      })}
                    />
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
                    autocompleteVariant={autocompleteVariant}
                    createWithoutConfirmation={createWithoutConfirmation}
                    className={menuClassName}
                    options={options}
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
