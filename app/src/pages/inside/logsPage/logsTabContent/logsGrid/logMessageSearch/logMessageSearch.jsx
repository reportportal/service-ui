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
import track from 'react-tracking';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages } from 'react-intl';
import { InputSearch } from 'components/inputs/inputSearch/inputSearch';
import { LOG_PAGE_EVENTS } from 'components/main/analytics/events';
import styles from './logMessageSearch.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  searchTitle: {
    id: 'LogMessageSearch.searchTitle',
    defaultMessage: 'Log message',
  },
  searchHint: {
    id: 'LogMessageSearch.searchHint',
    defaultMessage: 'At least 3 symbols required.',
  },
});

@injectIntl
@track()
export class LogMessageSearch extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    onFilterChange: PropTypes.func.isRequired,
    filter: PropTypes.string,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    filter: '',
  };

  constructor(props) {
    super(props);
    this.state = {
      inputValue: props.filter || '',
      isSearchHintRequired: false,
    };
  }

  onFocus = () => {
    if (this.state.inputValue.length < 3) {
      this.setState({
        isSearchHintRequired: true,
      });
    }
  };

  onBlur = () => {
    if (this.state.isSearchHintRequired) {
      this.setState({
        isSearchHintRequired: false,
      });
    }
  };

  handleInputChange = (event) => {
    if (!event.target.value || event.target.value.length >= 3) {
      this.props.tracking.trackEvent(LOG_PAGE_EVENTS.ENTER_LOG_MSG_FILTER);
      this.props.onFilterChange(event.target.value || undefined);
    }
    this.setState({
      inputValue: event.target.value,
      isSearchHintRequired: event.target.value.length < 3,
    });
  };

  render() {
    const { intl } = this.props;

    return (
      <div className={cx('log-message-search')}>
        <span className={cx('search-title')}>{intl.formatMessage(messages.searchTitle)}</span>
        <div className={cx('input-search-wrapper')}>
          <InputSearch
            className={cx('input-search')}
            value={this.state.inputValue}
            onChange={this.handleInputChange}
            onFocus={this.onFocus}
            onBlur={this.onBlur}
            searchHint={
              (this.state.isSearchHintRequired && intl.formatMessage(messages.searchHint)) || ''
            }
            iconAtRight
          />
        </div>
      </div>
    );
  }
}
