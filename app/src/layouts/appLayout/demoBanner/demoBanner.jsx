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

import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { INTERNAL, GITHUB } from 'common/constants/accountType';
import {
  flushDataInSelector,
  fetchAppInfoAction,
  authExtensionsSelector,
} from 'controllers/appInfo';
import { userInfoSelector } from 'controllers/user';
import { logoutAction } from 'controllers/auth';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { Timer } from 'components/main/timer';
import { normalizePathWithPrefix } from 'pages/outside/common/utils';
import styles from './demoBanner.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  descriptionGithub: {
    id: 'DemoBanner.descriptionGithub',
    defaultMessage: 'You are using Personal GitHub Project.',
  },
  descriptionDefault: {
    id: 'DemoBanner.descriptionDefault',
    defaultMessage:
      'Your are on the public Demo Account. For loading your sensitive data, please use ',
  },
  githubAuthTitle: {
    id: 'DemoBanner.githubAuthTitle',
    defaultMessage: 'GitHub authorization',
  },
  githubAuthNotFound: {
    id: 'DemoBanner.githubAuthNotFound',
    defaultMessage: 'GitHub authorization not configured. Contact your administrator',
  },
  timerCaption: {
    id: 'DemoBanner.timerCaption',
    defaultMessage: 'Data flush in',
  },
});

@connect(
  (state) => ({
    authExtensions: authExtensionsSelector(state),
    accountType: userInfoSelector(state).accountType,
    flushDataIn: flushDataInSelector(state),
  }),
  {
    logout: logoutAction,
    fetchAppInfo: fetchAppInfoAction,
    showNotification,
  },
)
@injectIntl
export class DemoBanner extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    authExtensions: PropTypes.object,
    accountType: PropTypes.string,
    flushDataIn: PropTypes.number,
    logout: PropTypes.func,
    fetchAppInfo: PropTypes.func,
    showNotification: PropTypes.func,
  };
  static defaultProps = {
    authExtensions: {},
    accountType: INTERNAL,
    flushDataIn: null,
    logout: () => {},
    fetchAppInfo: () => {},
    showNotification: () => {},
  };

  componentDidMount() {
    this.props.fetchAppInfo();
  }

  loginWithGitHub = (e) => {
    const {
      intl: { formatMessage },
    } = this.props;

    if (!this.getAuthPath()) {
      e.preventDefault();
      this.props.showNotification({
        type: NOTIFICATION_TYPES.ERROR,
        message: formatMessage(messages.githubAuthNotFound),
      });
    }
  };

  getAuthPath = () => (this.props.authExtensions.github || {}).path;

  getDescription = () => {
    const {
      intl: { formatMessage },
      accountType,
    } = this.props;

    if (accountType === GITHUB) {
      return formatMessage(messages.descriptionGithub);
    }

    const href = normalizePathWithPrefix(this.getAuthPath());

    return (
      <Fragment>
        {formatMessage(messages.descriptionDefault)}
        <a className={cx('github-login')} href={href} onClick={this.loginWithGitHub}>
          {formatMessage(messages.githubAuthTitle)}
        </a>
      </Fragment>
    );
  };

  render() {
    const {
      intl: { formatMessage },
      flushDataIn,
      logout,
    } = this.props;
    return (
      <div className={cx('demo-banner')}>
        <span className={cx('description')}>{this.getDescription()}</span>
        <Timer
          caption={formatMessage(messages.timerCaption)}
          remainingTime={flushDataIn}
          onFinish={logout}
        />
      </div>
    );
  }
}
