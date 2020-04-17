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
import { debounce, fetch, ERROR_CANCELED } from 'common/utils';

export const WithAsyncLoading = (AutocompleteComponent) =>
  class WrappedAutocomplete extends Component {
    static propTypes = {
      getURI: PropTypes.func,
      makeOptions: PropTypes.func,
      filterOption: PropTypes.func,
      minLength: PropTypes.number,
    };

    static defaultProps = {
      getURI: () => '',
      makeOptions: (values) => values,
      filterOption: () => true,
      minLength: 1,
    };

    state = {
      options: [],
      loading: false,
    };

    cancelToken = null;

    componentWillUnmount() {
      this.cancelToken && this.cancelToken();
      this.cancelDebounce && this.cancelDebounce();
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
          this.cancelToken = null;
        });
    }, 200);

    loadOptions = (inputValue) => {
      this.setState({ loading: true });
      this.cancelDebounce = this.debouncedFetch(inputValue);
    };

    handleStateChange = (changes, { isOpen, inputValue }) => {
      if (!isOpen) return;

      if (
        ('isOpen' in changes && !this.props.minLength) ||
        ('inputValue' in changes && (inputValue || '').trim().length >= this.props.minLength)
      ) {
        this.loadOptions(inputValue || '');
      }
    };

    render() {
      const { options, loading } = this.state;
      return (
        <AutocompleteComponent
          options={options}
          loading={loading}
          onStateChange={this.handleStateChange}
          async
          {...this.props}
        />
      );
    }
  };
