/*
 * Copyright 2026 EPAM Systems
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

import { ReactElement } from 'react';
import { CHART_MODES, MODES_VALUES } from 'common/constants/chartModes';
import { OverallStatisticsPanel } from './overallStatisticsPanel';
import type { OverallStatisticsPanelWidget } from './overallStatisticsPanel/overallStatisticsPanel';
import {
  LaunchExecutionAndIssueStatistics,
  LaunchExecutionAndIssueStatisticsProps,
} from '../launchExecutionAndIssueStatistics';

interface OverallStatisticsProps extends LaunchExecutionAndIssueStatisticsProps {
  widget: LaunchExecutionAndIssueStatisticsProps['widget'] & OverallStatisticsPanelWidget & {
    contentParameters: {
      widgetOptions: {
        viewMode?: string;
      };
    };
  };
}

const views: Record<string, (props: OverallStatisticsProps) => ReactElement> = {
  [MODES_VALUES[CHART_MODES.PANEL_VIEW] as string]: (props) => (
    <OverallStatisticsPanel {...props} />
  ),
  [MODES_VALUES[CHART_MODES.DONUT_VIEW] as string]: (props) => (
    <LaunchExecutionAndIssueStatistics {...props} />
  ),
};

export const OverallStatistics = (props: OverallStatisticsProps) => {
  const { viewMode } = props.widget.contentParameters.widgetOptions;

  return viewMode ? views[viewMode](props) : '';
};
