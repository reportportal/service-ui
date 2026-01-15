/*
 * Copyright 2025 EPAM Systems
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
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import track from 'react-tracking';
import GA4 from 'react-ga4';
import { gaMeasurementIdSelector } from 'controllers/appInfo/selectors';
import ReactObserver from 'react-event-observer';
import { sendAnalyticsEventAction } from 'controllers/analytics';

export const analyticsEventObserver = ReactObserver();

@connect(
  (state) => ({
    gaMeasurementId: gaMeasurementIdSelector(state),
  }),
  {
    sendAnalyticsEvent: sendAnalyticsEventAction,
  },
)
@track(({ children, dispatch, ...additionalData }) => additionalData, {
  dispatch: ({ gaMeasurementId, isEnabled, sendAnalyticsEvent, ...data }) => {
    if (!isEnabled) {
      return;
    }

    sendAnalyticsEvent(data);
  },
  process: ({ page, place }) => (page ? { action: 'page_view', page, place: place || '' } : null),
})
export class AnalyticsWrapper extends Component {
  static propTypes = {
    gaMeasurementId: PropTypes.string,
    children: PropTypes.node,
    isEnabled: PropTypes.bool,
  };

  static defaultProps = {
    children: null,
    gaMeasurementId: '',
    isEnabled: false,
  };

  initialize() {
    const { gaMeasurementId } = this.props;

    GA4.initialize(gaMeasurementId || 'G-Z22WZS0E4E', {
      gtagOptions: {
        anonymizeIp: true,
      },
    });
  }

  componentDidMount() {
    if (this.props.isEnabled) {
      this.initialize();
    }
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.isEnabled && this.props.isEnabled) {
      this.initialize();
      analyticsEventObserver.emit('analyticsWasEnabled', 'active');
    }
  }

  render() {
    return this.props.children;
  }
}
