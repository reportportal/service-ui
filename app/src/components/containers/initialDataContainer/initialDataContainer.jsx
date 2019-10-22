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
import { AnalyticsWrapper } from 'components/main/analytics/AnalyticsWrapper';
import { fetchInitialDataAction, initialDataReadySelector } from 'controllers/initialData';

@connect(
  (state) => ({
    isAnalyticsEnabled: analyticsEnabledSelector(state),
    isInitialDataReady: initialDataReadySelector(state),
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
  };

  static defaultProps = {
    children: null,
  };

  state = {
    initialDataReady: false,
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

  render() {
    const { isAnalyticsEnabled } = this.props;
    const component = isAnalyticsEnabled ? (
      <AnalyticsWrapper>{this.props.children}</AnalyticsWrapper>
    ) : (
      this.props.children
    );

    return this.props.isInitialDataReady ? component : <span>Loading...</span>;
  }
}
