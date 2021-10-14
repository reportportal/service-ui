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
import { idSelector } from 'controllers/user/selectors';

const PAGE_VIEW = 'pageview';
const GOOGLE_ANALYTICS_INSTANCE = 'UA-96321031-1';

@connect((state) => ({
  instanceId: instanceIdSelector(state),
  buildVersion: apiBuildVersionSelector(state),
  userId: idSelector(state),
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
  };

  static defaultProps = {
    children: null,
  };

  componentDidMount() {
    const { instanceId, buildVersion, userId } = this.props;
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
    });
    ReactGA.ga()('require', 'ec');
  }

  componentDidUpdate(prevProps) {
    const { userId } = this.props;
    if (prevProps.userId !== userId) {
      ReactGA.set({
        dimension3: userId,
      });
    }
  }

  render() {
    return this.props.children;
  }
}
