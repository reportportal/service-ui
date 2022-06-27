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
import { AutocompleteMenu } from './../common/autocompleteMenu';

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
      value,
      inputProps,
      maxLength,
      autocompleteVariant,
      isRequired,
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
          {({ getInputProps, getItemProps, isOpen, inputValue, highlightedIndex, openMenu }) => (
            <div>
              <Reference>
                {({ ref }) => (
                  <div ref={ref}>
                    <FieldText
                      {...getInputProps({
                        placeholder: !disabled ? placeholder : '',
                        maxLength,
                        onFocus: () => {
                          !value && openMenu();
                          onFocus();
                        },
                        onBlur,
                        disabled,
                        defaultWidth: false,
                        isRequired,
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
