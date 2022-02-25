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
import { instanceIdSelector, apiBuildVersionSelector } from 'controllers/appInfo';
import track from 'react-tracking';
import ReactGA from 'react-ga';
import { idSelector, isAdminSelector } from 'controllers/user/selectors';
import {
  autoAnalysisEnabledSelector,
  patternAnalysisEnabledSelector,
  projectInfoIdSelector,
} from 'controllers/project/selectors';
import { normalizeDimensionValue } from './utils';

const PAGE_VIEW = 'pageview';
const GOOGLE_ANALYTICS_INSTANCE = 'UA-96321031-1';

@connect((state) => ({
  instanceId: instanceIdSelector(state),
  buildVersion: apiBuildVersionSelector(state),
  userId: idSelector(state),
  isAutoAnalyzerEnabled: autoAnalysisEnabledSelector(state),
  isPatternAnalyzerEnabled: patternAnalysisEnabledSelector(state),
  projectId: projectInfoIdSelector(state),
  isAdmin: isAdminSelector(state),
}))
@track(
  {},
  {
    dispatch: (data) => {
      ReactGA.set({
        dimension4: Date.now(),
      });
      if (data.actionType && data.actionType === PAGE_VIEW) {
        ReactGA.pageview(data.page);
      } else {
        ReactGA.event(data);
      }
    },
    process: (ownTrackingData) => (ownTrackingData.page ? { actionType: PAGE_VIEW } : null),
  },
)
export class AnalyticsWrapper extends Component {
  static propTypes = {
    instanceId: PropTypes.string.isRequired,
    buildVersion: PropTypes.string.isRequired,
    children: PropTypes.node,
    userId: PropTypes.number.isRequired,
    isAutoAnalyzerEnabled: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]).isRequired,
    isPatternAnalyzerEnabled: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]).isRequired,
    projectId: PropTypes.number.isRequired,
    isAdmin: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    children: null,
  };

  componentDidMount() {
    const {
      instanceId,
      buildVersion,
      userId,
      isAutoAnalyzerEnabled,
      isPatternAnalyzerEnabled,
      projectId,
      isAdmin,
    } = this.props;
    const appVersion =
      buildVersion &&
      buildVersion
        .split('.')
        .splice(0, 2)
        .join('.');

    ReactGA.initialize(GOOGLE_ANALYTICS_INSTANCE);
    ReactGA.pageview(window.location.pathname + window.location.search);
    ReactGA.set({
      dimension1: instanceId,
      dimension2: appVersion,
      dimension3: userId,
      dimension4: Date.now(),
      dimension5: normalizeDimensionValue(isAutoAnalyzerEnabled),
      dimension6: normalizeDimensionValue(isPatternAnalyzerEnabled),
      dimension7: isAdmin ? undefined : projectId,
      anonymizeIp: true,
    });
    ReactGA.ga()('require', 'ec');
  }

  componentDidUpdate(prevProps) {
    const {
      userId,
      isAutoAnalyzerEnabled,
      isPatternAnalyzerEnabled,
      projectId,
      isAdmin,
    } = this.props;
    if (prevProps.userId !== userId) {
      ReactGA.set({
        dimension3: userId,
      });
    }
    if (prevProps.isAutoAnalyzerEnabled !== isAutoAnalyzerEnabled) {
      ReactGA.set({
        dimension5: normalizeDimensionValue(isAutoAnalyzerEnabled),
      });
    }
    if (prevProps.isPatternAnalyzerEnabled !== isPatternAnalyzerEnabled) {
      ReactGA.set({
        dimension6: normalizeDimensionValue(isPatternAnalyzerEnabled),
      });
    }
    if (prevProps.projectId !== projectId) {
      ReactGA.set({
        dimension7: isAdmin ? undefined : projectId,
      });
    }
  }

  render() {
    return this.props.children;
  }
}
