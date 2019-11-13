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
import track from 'react-tracking';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames/bind';
import { Input } from 'components/inputs/input';
import { FOOTER_EVENTS } from 'components/main/analytics/events';
import styles from './pageSizeControl.scss';

const cx = classNames.bind(styles);

const MAX_SIZE = 300;

@track()
export class PageSizeControl extends Component {
  static propTypes = {
    pageSize: PropTypes.number.isRequired,
    onChangePageSize: PropTypes.func,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    onChangePageSize: () => {},
  };

  state = {
    inputVisible: false,
    inputValue: '',
  };

  inputRef = (node) => {
    this.inputNode = node;
  };

  showInput = () =>
    this.setState({ inputVisible: true }, () => {
      this.inputNode.focus();
    });

  handleChange = (e) => {
    this.props.tracking.trackEvent(FOOTER_EVENTS.EDIT_NUMBER_PER_PAGE);
    this.setState({ inputValue: e.target.value });
  };

  normalizeInput = (value) => {
    if (Number(value) < 0 || isNaN(Number(value))) {
      return '0';
    } else if (Number(value) > MAX_SIZE) {
      return String(MAX_SIZE);
    }
    return value;
  };

  handleKeyPress = (e) => {
    const keyCode = e.keyCode || e.which;
    const keyValue = String.fromCharCode(keyCode);
    if (/([+-.e]|\D)/.test(keyValue)) {
      e.preventDefault();
    }
  };

  handleEnterKey = (e) => {
    const value = this.state.inputValue;
    if (e.keyCode === 13) {
      this.setState({ inputVisible: false, inputValue: '' });
      this.props.onChangePageSize(Number(this.normalizeInput(value)));
    }
  };

  render() {
    return (
      <div className={cx('page-size', { 'input-visible': this.state.inputVisible })}>
        {this.state.inputVisible ? (
          <SizeInput
            refFunction={this.inputRef}
            value={this.state.inputValue}
            onChange={this.handleChange}
            onKeyUp={this.handleEnterKey}
            onKeyPress={this.handleKeyPress}
          />
        ) : (
          <span className={cx('size-text')} onClick={this.showInput}>
            {this.props.pageSize}
          </span>
        )}{' '}
        <FormattedMessage id="PageSizeControl.perPage" defaultMessage="per page" />
      </div>
    );
  }
}

const SizeInput = ({ ...props }) => (
  <div className={cx('size-input')}>
    <Input {...props} type="text" maxLength="3" />
  </div>
);
