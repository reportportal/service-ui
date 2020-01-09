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
import { debounce, fetch, ERROR_CANCELED } from 'common/utils';
import isEqual from 'react-fast-compare';
import { AutocompletePrompt } from './autocompletePrompt';

export class AsyncAutocompleteOptions extends Component {
  static propTypes = {
    children: PropTypes.func,
    getURI: PropTypes.string,
    makeOptions: PropTypes.func,
    inputValue: PropTypes.string,
    filterOption: PropTypes.func,
    renderItem: PropTypes.func.isRequired,
    createNewOption: PropTypes.func,
    creatable: PropTypes.bool,
    parseValueToString: PropTypes.func,
    isValidNewOption: PropTypes.func,
  };

  static defaultProps = {
    children: null,
    getURI: () => '',
    makeOptions: (values) => values,
    inputValue: '',
    filterOption: () => true,
    creatable: false,
    createNewOption: (inputValue) => inputValue,
    parseValueToString: (value) => value || '',
    isValidNewOption: () => true,
  };

  state = {
    options: [],
    loading: false,
    inputValue: '',
  };

  cancelToken = null;

  componentDidMount() {
    this.fetchData(this.props.inputValue);
  }

  componentDidUpdate({ inputValue: prevInputValue }) {
    const { inputValue } = this.props;
    if (!isEqual(prevInputValue, inputValue)) {
      this.fetchData(inputValue);
    }
  }

  componentWillUnmount() {
    if (this.cancelToken) {
      this.cancelToken();
    }
    this.cancelDebounce();
  }

  debouncedFetch = debounce((inputValue) => {
    const { getURI, makeOptions, filterOption } = this.props;
    if (this.cancelToken) {
      this.cancelToken();
    }
    const uri = getURI(inputValue);
    fetch(uri, {
      abort: (cancelToken) => {
        this.cancelToken = cancelToken;
      },
    })
      .then((response) => {
        this.cancelToken = null;
        this.setState({
          options: makeOptions(response).filter(filterOption),
          loading: false,
        });
      })
      .catch((error) => {
        if (error.message !== ERROR_CANCELED) {
          this.setState({
            options: [],
            loading: false,
          });
        }
      });
  }, 200);

  fetchData = (inputValue) => {
    this.setState({ loading: true });
    this.cancelDebounce = this.debouncedFetch(inputValue);
  };

  getPrompt = () => {
    const { options, loading } = this.state;
    if (loading) {
      return (
        <AutocompletePrompt>
          <FormattedMessage id={'AsyncAutocomplete.loading'} defaultMessage={'Loading ...'} />
        </AutocompletePrompt>
      );
    }

    if (!options.length && !this.canCreateNewItem()) {
      return (
        <AutocompletePrompt>
          <FormattedMessage id={'AsyncAutocomplete.notFound'} defaultMessage={'Nothing found'} />
        </AutocompletePrompt>
      );
    }

    return '';
  };

  canCreateNewItem = () => {
    const { options } = this.state;
    const { creatable, inputValue, parseValueToString, isValidNewOption } = this.props;
    return (
      creatable &&
      (!options.length || !options.some((option) => parseValueToString(option) === inputValue)) &&
      isValidNewOption(inputValue)
    );
  };

  renderItems = () => {
    const { options } = this.state;
    const { inputValue, renderItem, createNewOption } = this.props;
    let newItem = null;

    if (this.canCreateNewItem()) {
      newItem = createNewOption(inputValue);
      return [newItem, ...options].map((item, index) =>
        renderItem(item, index, newItem && index === 0),
      );
    }

    return options.map((item, index) => renderItem(item, index));
  };

  render() {
    const prompt = this.getPrompt();
    if (prompt) return prompt;

    return this.renderItems();
  }
}
