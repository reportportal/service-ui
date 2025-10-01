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
import PropTypes from 'prop-types';
import moment from 'moment';
import classNames from 'classnames/bind';
import { injectIntl, defineMessages } from 'react-intl';
import track from 'react-tracking';
import { TIME_DATE_FORMAT } from 'common/constants/timeDateFormat';
import { InputTimeDateRangeMenu } from './inputTimeDateRangeMenu';
import styles from './inputTimeDateRange.scss';

const DEFAULT_DISPLAY_START_DATE = moment().startOf('day').valueOf();

const DEFAULT_DISPLAY_END_DATE = moment().endOf('day').valueOf() + 1;

const cx = classNames.bind(styles);
const messages = defineMessages({
  anyTime: {
    id: 'InputTimeDateRange.anyTime',
    defaultMessage: 'Any',
  },
});

@track()
@injectIntl
export class InputTimeDateRange extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    presets: PropTypes.array,
    value: PropTypes.object,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    withoutDynamic: PropTypes.bool,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    presets: [],
    value: {},
    onChange: () => {},
    onFocus: () => {},
    onBlur: () => {},
    withoutDynamic: false,
  };

  state = {
    opened: false,
    customRangeVisited: false,
  };

  componentDidMount() {
    document.addEventListener('click', this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  }

  onClickValueBlock = (e) => {
    this.setState({ opened: !this.state.opened });
    e.stopPropagation();
    this.state.opened ? this.props.onBlur() : this.props.onFocus();
  };

  onClickPreset = (preset) => {
    this.setState({ opened: false, customRangeVisited: false });
    this.props.onChange(preset.getValue());
  };

  setRef = (node) => {
    this.node = node;
  };

  getDateRangeString() {
    const { value, intl } = this.props;
    return value?.start && value.end
      ? `${moment(value.start).format(TIME_DATE_FORMAT)} - ${moment(value.end).format(
          TIME_DATE_FORMAT,
        )}`
      : intl.formatMessage(messages.anyTime);
  }

  handleClickOutside = (e) => {
    if (this.node && !this.node.contains(e.target) && this.state.opened) {
      this.setState({ opened: false, customRangeVisited: false });
      this.props.onBlur();
    }
  };

  handleChangeFrom = (m) => {
    const { end, dynamic } = this.props.value;
    this.props.onChange({
      start: moment(m).valueOf(),
      end: end || DEFAULT_DISPLAY_END_DATE,
      dynamic,
    });
    this.setState({ customRangeVisited: true });
  };

  handleChangeTo = (m) => {
    const { start, dynamic } = this.props.value;
    this.props.onChange({
      start: start || DEFAULT_DISPLAY_START_DATE,
      end: moment(m).valueOf(),
      dynamic,
    });
    this.setState({ customRangeVisited: true });
  };

  handleChangeDynamic = (e) => {
    const { start, end } = this.props.value;
    this.props.onChange({
      start: start || DEFAULT_DISPLAY_START_DATE,
      end: end || DEFAULT_DISPLAY_END_DATE,
      dynamic: e.target.checked,
    });
    this.setState({ customRangeVisited: false });
  };

  render() {
    const { presets, value, withoutDynamic } = this.props;
    return (
      <div className={cx('input-time-date-range')} ref={this.setRef}>
        <input
          readOnly
          value={this.getDateRangeString()}
          className={cx('current-value', { placeholder: !(value?.start && value.end) })}
          onClick={this.onClickValueBlock}
        />
        <InputTimeDateRangeMenu
          onClickPreset={this.onClickPreset}
          handleChangeFrom={this.handleChangeFrom}
          handleChangeTo={this.handleChangeTo}
          handleChangeDynamic={this.handleChangeDynamic}
          defaultDisplayStartDate={DEFAULT_DISPLAY_START_DATE}
          defaultDisplayEndDate={DEFAULT_DISPLAY_END_DATE}
          opened={this.state.opened}
          presets={presets}
          value={value}
          withoutDynamic={withoutDynamic}
        />
      </div>
    );
  }
}
