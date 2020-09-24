/*
 * Copyright 2020 EPAM Systems
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
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import moment from 'moment';
import classNames from 'classnames/bind';
import styles from './timer.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  hours: {
    id: 'Timer.hours',
    defaultMessage: 'h',
  },
  minutes: {
    id: 'Timer.minutes',
    defaultMessage: 'm',
  },
  seconds: {
    id: 'Timer.seconds',
    defaultMessage: 's',
  },
});

@injectIntl
export class Timer extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    timeLeft: PropTypes.number,
    onFinish: PropTypes.func,
    caption: PropTypes.string,
  };
  static defaultProps = {
    timeLeft: null,
    onFinish: () => {},
    caption: '',
  };

  constructor(props) {
    super(props);

    this.state = {
      timeLeft: props.timeLeft,
    };
  }

  componentDidMount() {
    this.startTimer();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.timeLeft !== this.props.timeLeft) {
      this.updateTimeLeft(this.props.timeLeft);
    }
  }

  componentWillUnmount() {
    clearInterval(this.timerId);
  }

  startTimer = () => {
    let { timeLeft } = this.state;
    this.timerId = setInterval(() => {
      timeLeft -= 1000;
      if (timeLeft < 0) {
        clearInterval(this.timerId);
        this.props.onFinish();
      } else {
        this.updateTimeLeft(timeLeft);
      }
    }, 1000);
  };

  updateTimeLeft = (timeLeft) => {
    this.setState({
      timeLeft,
    });
  };

  calculateTimeUnits = () => {
    const { timeLeft } = this.state;
    const duration = moment.duration(timeLeft);
    const hours = duration.hours();
    const minutes = duration.minutes();
    const seconds = duration.seconds();

    return [
      { id: 'h', value: hours, hint: messages.hours, withDelimiter: true },
      { id: 'm', value: minutes, hint: messages.minutes, withDelimiter: true },
      { id: 's', value: seconds, hint: messages.seconds },
    ];
  };

  render() {
    const {
      intl: { formatMessage },
      caption,
    } = this.props;
    const timeUnits = this.calculateTimeUnits();
    return (
      <div className={cx('timer')}>
        {caption}
        <div className={cx('time-units')}>
          {timeUnits.map((unit) => {
            return (
              <div
                key={unit.id}
                className={cx('time-unit', { 'with-delimiter': unit.withDelimiter })}
              >
                {unit.value}
                <span className={cx('unit-hint')}>{formatMessage(unit.hint)}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
