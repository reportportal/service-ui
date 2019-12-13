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

import PropTypes from 'prop-types';
import { CHART_MODES, MODES_VALUES } from 'common/constants/chartModes';
import { OverallStatisticsPanel } from './overallStatisticsPanel';
import { LaunchExecutionAndIssueStatistics } from '../launchExecutionAndIssueStatistics';

export class OverallStatistics extends React.Component {
  static propTypes = {
    widget: PropTypes.object.isRequired,
  };

  views = {
    [MODES_VALUES[CHART_MODES.PANEL_VIEW]]: (props) => <OverallStatisticsPanel {...props} />,
    [MODES_VALUES[CHART_MODES.DONUT_VIEW]]: (props) => (
      <LaunchExecutionAndIssueStatistics {...props} />
    ),
  };

  render() {
    const { viewMode } = this.props.widget.contentParameters.widgetOptions;

    return viewMode ? this.views[viewMode](this.props) : '';
  }
}
