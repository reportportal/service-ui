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
import { messages } from 'components/widgets/common/messages';
import { FAILED, PASSED, INTERRUPTED, SKIPPED } from 'common/constants/testStatuses';
import { ALL } from 'common/constants/reservedFilterIds';
import { getDefaultTestItemLinkParams } from 'components/widgets/common/utils';
import { statisticsLinkSelector } from 'controllers/testItem';
import { activeProjectSelector } from 'controllers/user';
import { STATS_PASSED } from 'common/constants/statistics';
import { PassingRateChart } from '../common/passingRateChart';

const getFilterName = ({ contentParameters, content: { result = {} } = {} } = {}) =>
  `${contentParameters.widgetOptions.launchNameFilter} #${result.number}`;

@connect(
  (state) => ({
    project: activeProjectSelector(state),
    getStatisticsLink: statisticsLinkSelector(state),
  }),
  {
    navigate: (linkAction) => linkAction,
  },
)
export class PassingRatePerLaunch extends Component {
  static propTypes = {
    getStatisticsLink: PropTypes.func.isRequired,
    navigate: PropTypes.func.isRequired,
    project: PropTypes.string.isRequired,
    widget: PropTypes.object.isRequired,
  };

  onChartClick = (data) => {
    const { widget, getStatisticsLink, project } = this.props;
    const launchId = widget.content.result.id;
    const link = getStatisticsLink({
      statuses: data.id === STATS_PASSED ? [PASSED] : [FAILED, INTERRUPTED, SKIPPED],
    });
    const navigationParams = getDefaultTestItemLinkParams(project, ALL, launchId);

    this.props.navigate(Object.assign(link, navigationParams));
  };
  render() {
    return (
      <PassingRateChart
        {...this.props}
        filterNameTitle={messages.launchName}
        filterName={getFilterName(this.props.widget)}
        onChartClick={this.onChartClick}
      />
    );
  }
}
