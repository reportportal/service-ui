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
import { assignedProjectsSelector } from 'controllers/user';
import { urlProjectSlugSelector } from 'controllers/pages';
import { normalizeDimensionValue, getAutoAnalysisEventValue } from './utils';

export const analyticsEventObserver = ReactObserver();

@connect((state) => ({
  baseEventParameters: baseEventParametersSelector(state),
  gaMeasurementId: gaMeasurementIdSelector(state),
  assignedProject: assignedProjectsSelector(state)[urlProjectSlugSelector(state)],
}))
@track(({ children, dispatch, ...additionalData }) => additionalData, {
  dispatch: ({ baseEventParameters, gaMeasurementId, assignedProject, isEnabled, ...data }) => {
    if (!isEnabled) {
      return;
    }

    const {
      instanceId,
      buildVersion,
      userId,
      isAutoAnalyzerEnabled,
      isPatternAnalyzerEnabled,
      isAdmin,
      isAnalyzerAvailable,
      organizationId,
    } = baseEventParameters;
    const { projectId, entryType } = assignedProject || {};

    if ('place' in data) {
      const eventParameters = {
        instanceID: instanceId,
        version: buildVersion,
        auto_analysis:
          getAutoAnalysisEventValue(isAnalyzerAvailable, isAutoAnalyzerEnabled) || 'not_set',
        pattern_analysis: normalizeDimensionValue(isPatternAnalyzerEnabled) || 'not_set',
        timestamp: Date.now(),
        organization_id: `${organizationId}|${instanceId}`,
        uid: `${userId}|${instanceId}`,
        kind: entryType || 'not_set',
        ...(!isAdmin && { project_id: `${projectId}|${instanceId}` }),
        ...omit(data, data.place ? ['action'] : ['action', 'place']),
      };
      GA4.event(data.action, eventParameters);
    }
  },
  process: ({ page, place }) => (page ? { action: 'pageview', page, place: place || '' } : null),
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
