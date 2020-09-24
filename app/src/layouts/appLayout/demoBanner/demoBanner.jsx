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
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { flushDataInSelector, fetchAppInfoAction } from 'controllers/appInfo';
import { logoutAction } from 'controllers/auth';
import { Timer } from 'components/main/timer';
import styles from './demoBanner.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  description: {
    id: 'DemoBanner.description',
    defaultMessage: 'You are using Personal GitHub Project.',
  },
  timerCaption: {
    id: 'DemoBanner.timerCaption',
    defaultMessage: 'Data flush in',
  },
});

@connect(
  (state) => ({
    flushDataIn: flushDataInSelector(state),
  }),
  {
    logout: logoutAction,
    fetchAppInfo: fetchAppInfoAction,
  },
)
@injectIntl
export class DemoBanner extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    flushDataIn: PropTypes.number,
    logout: PropTypes.func,
    fetchAppInfo: PropTypes.func,
  };
  static defaultProps = {
    flushDataIn: null,
    logout: () => {},
    fetchAppInfo: () => {},
  };

  componentDidMount() {
    this.props.fetchAppInfo();
  }

  render() {
    const {
      intl: { formatMessage },
      flushDataIn,
      logout,
      fetchAppInfo,
    } = this.props;
    return (
      <div className={cx('demo-banner')}>
        <div className={cx('demo-info')}>
          <span className={cx('description')}>{formatMessage(messages.description)}</span>
          <Timer
            caption={formatMessage(messages.timerCaption)}
            timeLeft={flushDataIn}
            receiveUpdates={fetchAppInfo}
            onFinish={logout}
          />
        </div>
      </div>
    );
  }
}
