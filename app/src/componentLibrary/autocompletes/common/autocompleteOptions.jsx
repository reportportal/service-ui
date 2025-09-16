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

import { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { BubblesLoader } from '@reportportal/ui-kit';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { autocompleteVariantType, singleAutocompleteOptionVariantType } from './propTypes';
import { AutocompletePrompt } from './autocompletePrompt';
import { AutocompleteOption } from './autocompleteOption';
import styles from './autocompleteOptions.scss';

const cx = classNames.bind(styles);

export class AutocompleteOptions extends Component {
  static propTypes = {
    children: PropTypes.func,
    options: PropTypes.array,
    loading: PropTypes.bool,
    inputValue: PropTypes.string,
    parseValueToString: PropTypes.func,
    getItemProps: PropTypes.func,
    renderOption: PropTypes.func,
    async: PropTypes.bool,
    optionVariant: singleAutocompleteOptionVariantType,
    createWithoutConfirmation: PropTypes.bool,
    variant: autocompleteVariantType,
    creatable: PropTypes.bool,
  };

  static defaultProps = {
    children: null,
    options: [],
    loading: false,
    inputValue: '',
    parseValueToString: (value) => value || '',
    getItemProps: () => {},
    renderOption: null,
    async: false,
    optionVariant: '',
    createWithoutConfirmation: false,
    variant: 'light',
    creatable: true,
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
    const { loading, createWithoutConfirmation, variant, creatable } = this.props;
    if (loading) {
      return (
        <>
          <AutocompletePrompt variant={variant}>
            <BubblesLoader />
          </AutocompletePrompt>
          {!createWithoutConfirmation && creatable && this.renderNewItem(options)}
        </>
      );
    }
    return '';
  };

  renderItem = (item, index, isNew = false) => {
    const { getItemProps, renderOption, optionVariant, variant } = this.props;
    return renderOption ? (
      renderOption(item, index, isNew, getItemProps)
    ) : (
      <AutocompleteOption
        key={this.props.parseValueToString(item)}
        optionVariant={optionVariant}
        {...getItemProps({ item, index })}
        isNew={isNew}
        variant={variant}
      >
        {this.props.parseValueToString(item)}
      </AutocompleteOption>
    );
  };

  renderItems = (options) => {
    return options.length ? options.map((item, index) => this.renderItem(item, index)) : '';
  };

  renderNewItem = (options) => {
    const { inputValue, getItemProps, optionVariant, variant } = this.props;
    const index = options.length;
    const isNew = true;
    return (
      <div className={cx({ container: !options.length })}>
        <AutocompleteOption
          key={this.props.parseValueToString(inputValue)}
          optionVariant={optionVariant}
          {...getItemProps({ item: inputValue, index })}
          isNew={isNew}
          variant={variant}
        >
          {this.props.parseValueToString(inputValue)}
        </AutocompleteOption>
      </div>
    );
  };

  render() {
    const { async, options, createWithoutConfirmation, creatable } = this.props;
    const availableOptions = async ? options : this.filterStaticOptions();
    const prompt = this.getPrompt(options);
    if (prompt) return prompt;
    return (
      <div className={cx({ container: options.length })}>
        <ScrollWrapper autoHeight autoHeightMax={140}>
          {this.renderItems(availableOptions)}
        </ScrollWrapper>
        {!createWithoutConfirmation && creatable && this.renderNewItem(availableOptions)}
      </div>
    );
  }
}
