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

import { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { AutocompletePrompt } from './autocompletePrompt';
import { AutocompleteOption } from './autocompleteOption';

export class AutocompleteOptions extends Component {
  static propTypes = {
    children: PropTypes.func,
    options: PropTypes.array,
    loading: PropTypes.bool,
    inputValue: PropTypes.string,
    createNewOption: PropTypes.func,
    creatable: PropTypes.bool,
    parseValueToString: PropTypes.func,
    isValidNewOption: PropTypes.func,
    getItemProps: PropTypes.func,
    renderOption: PropTypes.func,
    async: PropTypes.bool,
    notFoundPrompt: PropTypes.node,
    isOptionUnique: PropTypes.func,
    isOptionExist: PropTypes.func,
    pinnedOptions: PropTypes.array,
    createNewAtBottom: PropTypes.bool,
  };

  static defaultProps = {
    children: null,
    options: [],
    loading: false,
    inputValue: '',
    creatable: false,
    createNewOption: (inputValue) => inputValue,
    parseValueToString: (value) => value || '',
    isValidNewOption: () => true,
    getItemProps: () => {},
    renderOption: null,
    async: false,
    notFoundPrompt: (
      <FormattedMessage id={'AsyncAutocomplete.notFound'} defaultMessage={'No matches found'} />
    ),
    isOptionUnique: null,
    isOptionExist: null,
    pinnedOptions: [],
    createNewAtBottom: false,
  };

  filterStaticOptions = () => {
    const { options, inputValue, parseValueToString } = this.props;
    return (options || []).filter(
      (option) =>
        parseValueToString(option)
          .toUpperCase()
          .indexOf((inputValue.toUpperCase() || '').trim()) > -1,
    );
  };

  getPrompt = (options) => {
    const { loading, notFoundPrompt } = this.props;
    if (loading) {
      return (
        <AutocompletePrompt>
          <FormattedMessage id={'AsyncAutocomplete.loading'} defaultMessage={'Loading ...'} />
        </AutocompletePrompt>
      );
    }

    if (!options.length && !this.canCreateNewItem(options)) {
      return <AutocompletePrompt>{notFoundPrompt}</AutocompletePrompt>;
    }

    return '';
  };

  isOptionExist = (inputValue, options) =>
    this.props.isOptionExist
      ? this.props.isOptionExist(inputValue, options)
      : options.some((option) => this.props.parseValueToString(option) === inputValue);

  isOptionUnique = (inputValue, options) =>
    !this.props.isOptionUnique || this.props.isOptionUnique(inputValue, options);

  canCreateNewItem = (options) => {
    const { creatable, inputValue, isValidNewOption } = this.props;
    return (
      creatable &&
      inputValue &&
      (!options.length || !this.isOptionExist(inputValue, options)) &&
      this.isOptionUnique(inputValue, options) &&
      isValidNewOption(inputValue)
    );
  };

  renderItem = (item, index, isNew = false) => {
    const { getItemProps, renderOption } = this.props;
    return renderOption ? (
      renderOption(item, index, isNew, getItemProps)
    ) : (
      <AutocompleteOption
        key={this.props.parseValueToString(item)}
        {...getItemProps({ item, index })}
        isNew={isNew}
      >
        {this.props.parseValueToString(item)}
      </AutocompleteOption>
    );
  };

  renderItems = (options) => {
    const { inputValue, createNewOption, createNewAtBottom } = this.props;

    if (this.canCreateNewItem(options)) {
      const newItem = createNewOption(inputValue);
      if (createNewAtBottom) {
        const items = [...options, newItem];
        return items.map((item, index) =>
          this.renderItem(item, index, newItem && index === items.length - 1),
        );
      }
      return [newItem, ...options].map((item, index) =>
        this.renderItem(item, index, newItem && index === 0),
      );
    }

    return options.length ? options.map((item, index) => this.renderItem(item, index)) : '';
  };

  render() {
    const { async, pinnedOptions } = this.props;
    const loadedOptions = async ? this.props.options : this.filterStaticOptions();
    const options = [...pinnedOptions, ...loadedOptions];
    const prompt = this.getPrompt(options);
    if (prompt) return prompt;
    return this.renderItems(options);
  }
}
