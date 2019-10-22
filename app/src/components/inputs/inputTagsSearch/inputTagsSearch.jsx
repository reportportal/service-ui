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

import Select, { AsyncCreatable, Async, Creatable } from 'react-select';
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { fetch } from 'common/utils';
import styles from './inputTagsSearch.scss';

const cx = classNames.bind(styles);
const renderItems = (params) => (
  <ScrollWrapper autoHeight autoHeightMax={200}>
    {Select.defaultProps.menuRenderer(params)}
  </ScrollWrapper>
);

const selectType = (async, creatable) => {
  if (async) {
    if (creatable) {
      return AsyncCreatable;
    }
    return Async;
  } else if (creatable) {
    return Creatable;
  }
  return Select;
};

export class InputTagsSearch extends Component {
  static propTypes = {
    uri: PropTypes.string,
    options: PropTypes.array,
    value: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    placeholder: PropTypes.string,
    focusPlaceholder: PropTypes.string,
    loadingPlaceholder: PropTypes.string,
    nothingFound: PropTypes.string,
    error: PropTypes.string,
    touched: PropTypes.bool,
    creatable: PropTypes.bool,
    async: PropTypes.bool,
    multi: PropTypes.bool,
    removeSelected: PropTypes.bool,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    makeOptions: PropTypes.func,
    isValidNewOption: PropTypes.func,
    minLength: PropTypes.number,
    showNewLabel: PropTypes.bool,
    dynamicSearchPromptText: PropTypes.bool,
    isClearable: PropTypes.bool,
    disabled: PropTypes.bool,
    mobileDisabled: PropTypes.bool,
    customClass: PropTypes.string,
    isOptionUnique: PropTypes.func,
    inputProps: PropTypes.object,
    filterOption: PropTypes.func,
    onInputChange: PropTypes.func,
  };
  static defaultProps = {
    uri: '',
    options: [],
    value: null,
    placeholder: '',
    focusPlaceholder: '',
    loadingPlaceholder: '',
    nothingFound: '',
    error: '',
    touched: false,
    creatable: false,
    async: false,
    multi: false,
    removeSelected: false,
    makeOptions: () => {},
    onChange: () => {},
    isValidNewOption: ({ label }) => label,
    onFocus: () => {},
    onBlur: () => {},
    minLength: 1,
    showNewLabel: false,
    dynamicSearchPromptText: false,
    isClearable: true,
    disabled: false,
    mobileDisabled: false,
    customClass: null,
    isOptionUnique: null,
    inputProps: {},
    filterOption: () => true,
    onInputChange: () => {},
  };
  state = {
    searchPromptText: this.props.nothingFound,
  };
  onInputChange = (input) => {
    const diff = this.props.minLength - input.length;

    if (this.props.dynamicSearchPromptText && this.props.minLength && diff > 0) {
      const dynamicSearchPromptText = (
        <FormattedMessage
          id={'InputTagsSearch.dynamicSearchPromptText'}
          defaultMessage={'Please enter {length} or more characters'}
          values={{ length: diff }}
        />
      );
      this.setState({ searchPromptText: dynamicSearchPromptText });
    } else {
      this.setState({ searchPromptText: this.props.nothingFound });
    }
    this.props.onInputChange(input);
    return input;
  };
  getItems = (input) => {
    if (input.length >= this.props.minLength) {
      return fetch(`${this.props.uri}${input}`).then((response) => {
        const options = this.props.makeOptions(response);
        return { options };
      });
    }
    return Promise.resolve({ options: [] });
  };
  renderOption = (option) => (
    <div
      className={cx('select2-item')}
      key={option.value}
      onClick={() => {
        this.props.onChange(option.value);
      }}
    >
      <span>{option.label}</span>
    </div>
  );
  renderNewItemLabel = (label) => {
    if (this.props.showNewLabel) {
      return (
        <div>
          <span>{label}</span>
          <span className={cx('new')}>
            <FormattedMessage id="InputTagsSearch.new" defaultMessage="New" />
          </span>
        </div>
      );
    }
    return label;
  };

  render() {
    const {
      touched,
      async,
      creatable,
      loadingPlaceholder,
      focusPlaceholder,
      value,
      options,
      onChange,
      multi,
      removeSelected,
      placeholder,
      isClearable,
      disabled,
      error,
      onFocus,
      isValidNewOption,
      onBlur,
      mobileDisabled,
      customClass,
      isOptionUnique,
      inputProps,
      filterOption,
    } = this.props;
    const SelectComponent = selectType(async, creatable);

    return (
      <div
        className={cx(
          'select-container',
          { error, touched, 'mobile-disabled': mobileDisabled },
          customClass,
        )}
      >
        <SelectComponent
          loadOptions={this.getItems}
          placeholder={placeholder}
          autoload={false}
          cache={false}
          className={cx('select2-search-tags')}
          noResultsText={this.state.searchPromptText}
          onInputChange={this.onInputChange}
          optionRenderer={this.renderOption}
          menuRenderer={renderItems}
          promptTextCreator={this.renderNewItemLabel}
          onBlur={onBlur}
          loadingPlaceholder={loadingPlaceholder}
          searchPromptText={focusPlaceholder}
          value={value}
          options={options}
          onChange={onChange}
          onFocus={onFocus}
          multi={multi}
          isValidNewOption={isValidNewOption}
          removeSelected={removeSelected}
          clearable={isClearable}
          disabled={disabled}
          isOptionUnique={isOptionUnique || undefined}
          inputProps={inputProps}
          filterOption={filterOption}
        />
      </div>
    );
  }
}
