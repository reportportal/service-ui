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
import { connect } from 'react-redux';
import { analyticsEnabledSelector } from 'controllers/appInfo';
import { AnalyticsWrapper } from 'components/main/analytics';
import {
  fetchInitialDataAction,
  initialDataReadySelector,
  serviceAvailabilitySelector,
  LAST_VISITED_PATH_STORAGE_KEY,
} from 'controllers/initialData';
import { getSessionItem, removeSessionItem } from 'common/utils';
import { ServiceUnavailableScreen } from './serviceUnavailableScreen';

@connect(
  (state) => ({
    isAnalyticsEnabled: analyticsEnabledSelector(state),
    isInitialDataReady: initialDataReadySelector(state),
    serviceAvailability: serviceAvailabilitySelector(state),
  }),
  {
    fetchInitialDataAction,
  },
)
export class InitialDataContainer extends Component {
  static propTypes = {
    children: PropTypes.node,
    initialDispatch: PropTypes.func.isRequired,
    isAnalyticsEnabled: PropTypes.bool.isRequired,
    fetchInitialDataAction: PropTypes.func.isRequired,
    isInitialDataReady: PropTypes.bool.isRequired,
    serviceAvailability: PropTypes.shape({
      checked: PropTypes.bool.isRequired,
      apiUnavailable: PropTypes.bool.isRequired,
    }).isRequired,
  };

  static defaultProps = {
    children: null,
  };

  componentDidMount() {
    this.props.fetchInitialDataAction();
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.isInitialDataReady !== this.props.isInitialDataReady &&
      this.props.isInitialDataReady
    ) {
      this.props.initialDispatch();
    }
  }

  refreshPage = () => {
    const storedLastPath = getSessionItem(LAST_VISITED_PATH_STORAGE_KEY);
    removeSessionItem(LAST_VISITED_PATH_STORAGE_KEY);

    const targetPath =
      typeof storedLastPath === 'string' && storedLastPath.startsWith('/')
        ? storedLastPath
        : '/login';
    const normalizedHash = targetPath.startsWith('#') ? targetPath : `#${targetPath}`;

    if (window.location.hash !== normalizedHash) {
      window.location.hash = normalizedHash;
    }

    window.location.reload();
  };

  render() {
    const { isAnalyticsEnabled, isInitialDataReady, children } = this.props;
    const { checked, apiUnavailable } = this.props.serviceAvailability;

    if (!isInitialDataReady && checked && apiUnavailable) {
      return <ServiceUnavailableScreen onRefresh={this.refreshPage} />;
    }

    return isInitialDataReady ? (
      <AnalyticsWrapper isEnabled={isAnalyticsEnabled}>{children}</AnalyticsWrapper>
    ) : (
      <span>Loading...</span>
    );
  }
}
