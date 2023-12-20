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
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { baseEventParametersSelector } from 'controllers/appInfo';
import track from 'react-tracking';
import GA4 from 'react-ga4';
import { omit } from 'common/utils';
import { gaMeasurementIdSelector } from 'controllers/appInfo/selectors';
import ReactObserver from 'react-event-observer';
import { normalizeDimensionValue, getAppVersion, getAutoAnalysisEventValue } from './utils';

export const analyticsEventObserver = ReactObserver();

@connect((state) => ({
  baseEventParameters: baseEventParametersSelector(state),
  gaMeasurementId: gaMeasurementIdSelector(state),
}))
@track(({ children, dispatch, ...additionalData }) => additionalData, {
  dispatchOnMount: () => {
    queueMicrotask(() => analyticsEventObserver.emit('analyticsWasEnabled', 'active'));
  },
  dispatch: ({ baseEventParameters, gaMeasurementId, ...data }) => {
    const {
      instanceId,
      buildVersion,
      userId,
      isAutoAnalyzerEnabled,
      isPatternAnalyzerEnabled,
      projectInfoId,
      isAdmin,
    } = baseEventParameters;

    if ('place' in data) {
      const eventParameters = {
        instanceID: instanceId,
        version: getAppVersion(buildVersion),
        uid: `${userId}|${instanceId}`,
        auto_analysis: getAutoAnalysisEventValue(isAutoAnalyzerEnabled),
        pattern_analysis: normalizeDimensionValue(isPatternAnalyzerEnabled),
        timestamp: Date.now(),
        ...(!isAdmin && { project_id: `${projectInfoId}|${instanceId}` }),
        ...omit(data, data.place ? ['action'] : ['action', 'place']),
      };
      GA4.event(data.action, eventParameters);
    }
  },
  process: ({ page }) => (page ? { action: 'pageview', page, place: '' } : null),
})
export class AnalyticsWrapper extends Component {
  static propTypes = {
    gaMeasurementId: PropTypes.string,
    children: PropTypes.node,
  };

  static defaultProps = {
    children: null,
    gaMeasurementId: '',
  };

  componentDidMount() {
    const { gaMeasurementId } = this.props;

    GA4.initialize(gaMeasurementId || 'G-Z22WZS0E4E', {
      gtagOptions: {
        anonymizeIp: true,
      },
    });
  }

  render() {
    return this.props.children;
  }
}
