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
import { defineMessages, injectIntl } from 'react-intl';
import Parser from 'html-react-parser';
import { fetch } from 'common/utils/fetch';
import { URLS } from 'common/urls';
import { connect } from 'react-redux';
import track from 'react-tracking';
import { ADMIN_SERVER_SETTINGS_PAGE_EVENTS } from 'components/main/analytics/events';
import { showNotification, NOTIFICATION_TYPES } from 'controllers/notification';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import classNames from 'classnames/bind';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import { BigButton } from 'components/buttons/bigButton';
import ArrowRightIcon from 'common/img/arrow-right-inline.svg';
import {
  analyticsEnabledSelector,
  fetchAppInfoAction,
  ANALYTICS_ALL_KEY,
} from 'controllers/appInfo';
import styles from './analyticsTab.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  analyticsInfo: {
    id: 'AnalyticsTab.analyticsInfo',
    defaultMessage: `You can help us improve ReportPortal.<br/>While you're using the app, we'll gather analytics that might help us improve Report Portal performance and usability by tracking usage frequency of particular features.<br/>See below for details about what information is sent.`,
  },
  analyticsList: {
    id: 'AnalyticsTab.analyticsList',
    defaultMessage: 'LIST OF SENT ANALYTICS',
  },
  analyticsListMessage: {
    id: 'AnalyticsTab.analyticsListMessage',
    defaultMessage: `Usage analytics usually won't include any personal information, but it might include:`,
  },
  analyticsListPoint1: {
    id: 'AnalyticsTab.analyticsListPoint1',
    defaultMessage:
      'Device information - such as your hardware model, operating system version, screen resolution, browser version;',
  },
  analyticsListPoint2: {
    id: 'AnalyticsTab.analyticsListPoint2',
    defaultMessage:
      'Behavior information - such as details of how you use ReportPortal, where you click, and what actions you do, how long you leave the app open.',
  },
  analyticsEnabled: {
    id: 'AnalyticsTab.analyticsEnabled',
    defaultMessage: 'Help make Report Portal better by automatically sending analytics to us',
  },
  updateAnalyticsEnabledSuccess: {
    id: 'AnalyticsTab.updateAnalyticsEnabledSuccess',
    defaultMessage: 'Server settings were successfully updated',
  },
});

@connect(
  (state) => ({
    analyticsEnabled: analyticsEnabledSelector(state),
  }),
  {
    showNotification,
    fetchInfo: fetchAppInfoAction,
  },
)
@injectIntl
@track()
export class AnalyticsTab extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    showNotification: PropTypes.func,
    fetchInfo: PropTypes.func,
    analyticsEnabled: PropTypes.bool,
    tracking: PropTypes.shape({
      trackEvent: PropTypes.func,
      getTrackingData: PropTypes.func,
    }).isRequired,
  };

  static defaultProps = {
    change: () => {},
    showNotification: () => {},
    fetchInfo: () => {},
    analyticsEnabled: false,
  };

  static getDerivedStateFromProps(props, state) {
    if (props.analyticsEnabled !== state.prevAnalyticsEnabledValue) {
      return {
        analyticsEnabled: props.analyticsEnabled,
        prevAnalyticsEnabledValue: state.analyticsEnabled,
      };
    }
    return null;
  }

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      listShown: false,
      analyticsEnabled: props.analyticsEnabled,
      prevAnalyticsEnabledValue: props.analyticsEnabled,
    };
  }

  onListClick = () => {
    this.setState((state) => ({
      listShown: !state.listShown,
    }));
  };

  submit = () => {
    this.props.tracking.trackEvent(ADMIN_SERVER_SETTINGS_PAGE_EVENTS.SUBMIT_ANALYTICS_BTN);
    this.setState({
      loading: true,
    });
    this.updateStatisticsConfig(this.state.analyticsEnabled);
  };

  toggleStatistics = () => {
    this.state.analyticsEnabled
      ? this.props.tracking.trackEvent(
          ADMIN_SERVER_SETTINGS_PAGE_EVENTS.MAKE_RP_GREAT_AGAIN_UNCHECK,
        )
      : this.props.tracking.trackEvent(ADMIN_SERVER_SETTINGS_PAGE_EVENTS.MAKE_RP_GREAT_AGAIN_CHECK);
    this.setState({ analyticsEnabled: !this.state.analyticsEnabled });
  };

  updateStatisticsConfig = (analyticsEnabled) => {
    fetch(URLS.analyticsServerSettings(), {
      method: 'POST',
      data: {
        type: ANALYTICS_ALL_KEY,
        enabled: analyticsEnabled,
      },
    })
      .then(this.updateSettingSuccess)
      .catch(this.catchRequestError);
  };

  updateSettingSuccess = () => {
    const {
      intl: { formatMessage },
      fetchInfo,
    } = this.props;

    this.props.showNotification({
      message: formatMessage(messages.updateAnalyticsEnabledSuccess),
      type: NOTIFICATION_TYPES.SUCCESS,
    });

    this.setState({
      loading: false,
    });
    fetchInfo();
  };

  catchRequestError = (error) => {
    this.setState({
      loading: false,
    });

    this.props.showNotification({
      message: error.message,
      type: NOTIFICATION_TYPES.ERROR,
    });
  };

  render() {
    const {
      intl: { formatMessage },
    } = this.props;

    return (
      <div className={cx('analytics-settings-tab')}>
        <div className={cx('analytics-settings-form')}>
          <div className={cx('image-holder')} />
          <p className={cx('analytics-info')}>{Parser(formatMessage(messages.analyticsInfo))}</p>

          <div className={cx('analytics-list')}>
            <div className={cx('analytics-list-toggler')} onClick={this.onListClick}>
              <span>{formatMessage(messages.analyticsList)}</span>
              <span className={cx('arrow', { rotated: this.state.listShown })}>
                {Parser(ArrowRightIcon)}
              </span>
            </div>

            <div className={cx('list-message', { 'list-shown': this.state.listShown })}>
              <p>{formatMessage(messages.analyticsListMessage)}</p>
              <ul>
                <li className={cx('analytics-point')}>
                  {formatMessage(messages.analyticsListPoint1)}
                </li>
                <li className={cx('analytics-point')}>
                  {formatMessage(messages.analyticsListPoint2)}
                </li>
              </ul>
            </div>
          </div>

          {this.state.loading ? (
            <SpinningPreloader />
          ) : (
            <div className={cx('enabled-checkbox')}>
              <InputCheckbox
                className={cx('enabled-checkbox')}
                value={this.state.analyticsEnabled}
                onChange={this.toggleStatistics}
              >
                {formatMessage(messages.analyticsEnabled)}
              </InputCheckbox>
            </div>
          )}
          <BigButton
            className={cx('submit-button')}
            disabled={this.state.loading}
            onClick={this.submit}
            mobileDisabled
          >
            <span className={cx('submit-button-title')}>
              {formatMessage(COMMON_LOCALE_KEYS.SUBMIT)}
            </span>
          </BigButton>
        </div>
        <div className={cx('mobile-disabling-cover')} />
      </div>
    );
  }
}
