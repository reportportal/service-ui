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
import PropTypes from 'prop-types';
import moment from 'moment';
import classNames from 'classnames/bind';
import styles from './timer.scss';

const cx = classNames.bind(styles);

export class Timer extends Component {
  static propTypes = {
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
        this.updateTimeLeft();
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

    return {
      hours,
      minutes,
      seconds,
    };
  };

  render() {
    const { hours, minutes, seconds } = this.calculateTimeUnits();
    return (
      <div className={cx('timer')}>
        {this.props.caption} {`${hours}:${minutes}:${seconds}`}
      </div>
    );
  }
}
