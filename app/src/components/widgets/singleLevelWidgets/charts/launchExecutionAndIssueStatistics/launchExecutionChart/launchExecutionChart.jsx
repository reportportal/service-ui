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
import { statisticsLinkSelector } from 'controllers/testItem';
import { FAILED, INTERRUPTED } from 'common/constants/testStatuses';
import { DonutChart } from '../common/donutChart';
import { getColumns } from './utils';

@connect((state) => ({
  getStatisticsLink: statisticsLinkSelector(state),
}))
export class LaunchExecutionChart extends Component {
  static propTypes = {
    widget: PropTypes.object.isRequired,
    isPreview: PropTypes.bool.isRequired,
    getStatisticsLink: PropTypes.func.isRequired,
    container: PropTypes.instanceOf(Element).isRequired,
    uncheckedLegendItems: PropTypes.array,
    onChangeLegend: PropTypes.func,
    onStatusPageMode: PropTypes.bool,
    heightOffset: PropTypes.number,
  };

  static defaultProps = {
    uncheckedLegendItems: [],
    onChangeLegend: () => {},
    onStatusPageMode: false,
    heightOffset: 0,
  };

  getChartClickLink = (nameConfig, { isListType, ...params }) => {
    const { getStatisticsLink } = this.props;

    if (isListType) {
      return getStatisticsLink({
        statuses: this.getLinkParametersStatuses(nameConfig),
        ...params,
      });
    }

    return getStatisticsLink({
      statuses: [nameConfig.defectType.toUpperCase()],
    });
  };

  getLinkParametersStatuses = ({ defectType }) => {
    if (defectType.toUpperCase() === FAILED) {
      return [FAILED, INTERRUPTED];
    }
    return [defectType.toUpperCase()];
  };

  render() {
    const { getStatisticsLink, ...props } = this.props;

    return (
      <DonutChart
        {...props}
        chartText={'SUM'}
        getLink={this.getChartClickLink}
        configParams={{ getColumns }}
      />
    );
  }
}
