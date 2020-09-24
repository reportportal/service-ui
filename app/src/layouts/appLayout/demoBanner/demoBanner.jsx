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
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { flushDataInSelector } from 'controllers/appInfo';
import { logoutAction } from 'controllers/auth';
import { Timer } from './timer';
import styles from './demoBanner.scss';

const cx = classNames.bind(styles);

@connect(
  (state) => ({
    flushDataIn: flushDataInSelector(state),
  }),
  {
    logout: logoutAction,
  },
)
export class DemoBanner extends Component {
  static propTypes = {
    flushDataIn: PropTypes.number,
    logout: PropTypes.func,
  };
  static defaultProps = {
    flushDataIn: null,
    logout: () => {},
  };

  render() {
    const { flushDataIn, logout } = this.props;
    return (
      <div className={cx('demo-banner')}>
        <div className={cx('demo-info')}>
          <span className={cx('description')}>You are using Personal GitHub Project.</span>
          <Timer caption="Data flush in" timeLeft={flushDataIn} onFinish={logout} />
        </div>
      </div>
    );
  }
}
