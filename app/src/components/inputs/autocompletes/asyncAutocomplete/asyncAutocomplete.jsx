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
import { FormattedMessage } from 'react-intl';
import Downshift from 'downshift';
import Parser from 'html-react-parser';
import CrossIcon from 'common/img/cross-icon-inline.svg';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { AutocompleteOption } from './../common/autocompleteOption';
import { AsyncAutocompleteOptions } from './../common/asyncAutocompleteOptions';
import { AutocompleteMenu } from './../common/autocompleteMenu';
import { AutocompletePrompt } from './../common/autocompletePrompt';
import styles from './asyncAutocomplete.scss';

const cx = classNames.bind(styles);

export class AsyncAutocomplete extends Component {
  static propTypes = {
    getURI: PropTypes.string,
    value: PropTypes.any,
    placeholder: PropTypes.string,
    error: PropTypes.string,
    touched: PropTypes.bool,
    creatable: PropTypes.bool,
    makeOptions: PropTypes.func,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    isValidNewOption: PropTypes.func,
    disabled: PropTypes.bool,
    mobileDisabled: PropTypes.bool,
    inputProps: PropTypes.object,
    filterOption: PropTypes.func,
    parseValueToString: PropTypes.func,
    renderOption: PropTypes.func,
    createNewOption: PropTypes.func,
    minLength: PropTypes.number,
  };

  static defaultProps = {
    getURI: () => '',
    value: '',
    placeholder: '',
    error: '',
    touched: false,
    creatable: false,
    makeOptions: (values) => values,
    onChange: () => {},
    isValidNewOption: () => true,
    onFocus: () => {},
    onBlur: () => {},
    disabled: false,
    mobileDisabled: false,
    inputProps: {},
    filterOption: () => true,
    parseValueToString: (value) => value || '',
    renderOption: null,
    createNewOption: (inputValue) => inputValue,
    minLength: 1,
  };

  renderItem = (getItemProps, highlightedIndex, selectedItem) => (item, index, isNew = false) =>
    this.props.renderOption ? (
      this.props.renderOption(item, index, isNew, getItemProps, highlightedIndex, selectedItem)
    ) : (
      <AutocompleteOption
        key={this.props.parseValueToString(item)}
        {...getItemProps({
          item,
          index,
          isActive: isNew || highlightedIndex === index,
          isSelected: selectedItem === item,
        })}
        isNew={isNew}
      >
        {this.props.parseValueToString(item)}
      </AutocompleteOption>
    );

  getMinLenghtPropmt = (inputValue = '') => {
    const diff = this.props.minLength - inputValue.trim().length;
    if (this.props.minLength && diff > 0) {
      return (
        <AutocompletePrompt>
          <FormattedMessage
            id={'AsyncAutocomplete.dynamicSearchPromptText'}
            defaultMessage={'Please enter {length} or more characters'}
            values={{ length: diff }}
          />
        </AutocompletePrompt>
      );
    }
    return '';
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
      value,
      getURI,
      makeOptions,
      inputProps,
      filterOption,
      creatable,
      createNewOption,
      isValidNewOption,
    } = this.props;
    return (
      <Downshift onChange={onChange} itemToString={parseValueToString} selectedItem={value}>
        {({
          getInputProps,
          getMenuProps,
          getItemProps,
          isOpen,
          clearSelection,
          selectedItem,
          inputValue,
          highlightedIndex,
          openMenu,
        }) => (
          <div className={cx('autocomplete-container')}>
            <div className={cx('autocomplete')}>
              <input
                {...getInputProps({
                  placeholder,
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
              {selectedItem && !(disabled || mobileDisabled) && (
                <button className={cx('input-control-btn')} onClick={clearSelection}>
                  <i className={cx('cross-icon')}>{Parser(CrossIcon)}</i>
                </button>
              )}
            </div>
            <AutocompleteMenu
              promptMessage={this.getMinLenghtPropmt(inputValue)}
              {...getMenuProps({ isOpen })}
            >
              <AsyncAutocompleteOptions
                getURI={getURI}
                makeOptions={makeOptions}
                inputValue={(inputValue || '').trim()}
                filterOption={filterOption}
                creatable={creatable}
                renderItem={this.renderItem(getItemProps, highlightedIndex, value)}
                createNewOption={createNewOption}
                parseValueToString={parseValueToString}
                isValidNewOption={isValidNewOption}
              />
            </AutocompleteMenu>
          </div>
        )}
      </Downshift>
    );
  }
}
