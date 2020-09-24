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
import classNames from 'classnames/bind';
import { setStorageItem, getStorageItem, clearStorage } from 'common/utils';
import styles from './timer.scss';

const cx = classNames.bind(styles);

export class Timer extends Component {
  static propTypes = {
    endTime: PropTypes.number,
    onFinish: PropTypes.func,
  };
  static defaultProps = {
    endTime: null,
    onFinish: () => {},
  };

  constructor(props) {
    super(props);

    setStorageItem('flushing_time', getStorageItem('flushing_time') || props.endTime);
    const flushingTime = getStorageItem('flushing_time');

    const hours = Math.floor(flushingTime / 3600 / 1000);
    const minutes = Math.floor((flushingTime - hours * 3600 * 1000) / 60 / 1000);
    const seconds = Math.floor((flushingTime - hours * 3600 * 1000 - minutes * 60 * 1000) / 1000);
    this.state = {
      hours,
      minutes,
      seconds,
    };
  }

  componentDidMount() {
    this.startTimer();
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  startTimer = () => {
    let flushingTime = getStorageItem('flushing_time');
    this.timer = setInterval(() => {
      flushingTime -= 1000;
      if (flushingTime < 0) {
        clearInterval(this.timer);
        clearStorage();
        this.props.onFinish();
      } else {
        setStorageItem('flushing_time', flushingTime);
        const hours = Math.floor(flushingTime / 3600 / 1000);
        const minutes = Math.floor((flushingTime - hours * 3600 * 1000) / 60 / 1000);
        const seconds = Math.floor(
          (flushingTime - hours * 3600 * 1000 - minutes * 60 * 1000) / 1000,
        );
        this.setState({
          hours,
          minutes,
          seconds,
        });
      }
    }, 1000);
  };

  render() {
    const { hours, minutes, seconds } = this.state;
    return (
      <div className={cx('demo-banner')}>Data flush in {`${hours}:${minutes}:${seconds}`}</div>
    );
  }
}
